create table profiles(
 id uuid primary key references auth.users on delete cascade,
 name text not null, role text not null check (role in ('comprador','vendedor')),
 store_name text, store_description text, location text, rating numeric default 5);
create table requests(
 id uuid primary key default gen_random_uuid(),
 buyer_id uuid not null references profiles(id), category text not null,
 title text not null, quantity int not null default 1, specs text, notes text,
 budget numeric, image_url text,
 status text not null default 'aberta' check (status in ('aberta','em_negociacao','concluida','encerrada')),
 created_at timestamptz default now());
create table proposals(
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references requests(id) on delete cascade,
 seller_id uuid not null references profiles(id), product text not null,
 price numeric not null, quantity int not null default 1, delivery_days int,
 payment_terms text, notes text,
 status text not null default 'enviada' check (status in ('enviada','aceita','recusada','cancelada')),
 created_at timestamptz default now(), unique(request_id, seller_id));
create table messages(
 id uuid primary key default gen_random_uuid(),
 proposal_id uuid not null references proposals(id) on delete cascade,
 sender_id uuid not null references profiles(id), body text, image_url text,
 read boolean default false, created_at timestamptz default now());

create function is_participant(p uuid) returns boolean language sql security definer as $$
 select exists(select 1 from proposals pr join requests r on r.id=pr.request_id
  where pr.id=p and (pr.seller_id=auth.uid() or r.buyer_id=auth.uid())) $$;

alter table profiles enable row level security; alter table requests enable row level security;
alter table proposals enable row level security; alter table messages enable row level security;

create policy "perfis visiveis" on profiles for select to authenticated using (true);
create policy "perfil proprio" on profiles for update to authenticated using (id=auth.uid());
create policy "ver solicitacoes" on requests for select to authenticated using (true);
create policy "criar solicitacao" on requests for insert to authenticated with check (buyer_id=auth.uid());
create policy "dono altera" on requests for update to authenticated using (buyer_id=auth.uid());
create policy "ver propostas" on proposals for select to authenticated using
 (seller_id=auth.uid() or exists(select 1 from requests r where r.id=request_id and r.buyer_id=auth.uid()));
create policy "vendedor propõe" on proposals for insert to authenticated with check (seller_id=auth.uid());
create policy "partes alteram" on proposals for update to authenticated using
 (seller_id=auth.uid() or exists(select 1 from requests r where r.id=request_id and r.buyer_id=auth.uid()));
-- chat privado: somente comprador e vendedor da proposta
create policy "ler chat" on messages for select to authenticated using (is_participant(proposal_id));
create policy "enviar chat" on messages for insert to authenticated with check (sender_id=auth.uid() and is_participant(proposal_id));
create policy "marcar lida" on messages for update to authenticated using (is_participant(proposal_id));

create function handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into profiles(id,name,role,store_name,store_description,location)
 values(new.id,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'role',
 new.raw_user_meta_data->>'store_name',new.raw_user_meta_data->>'store_description',new.raw_user_meta_data->>'location');
 return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
alter publication supabase_realtime add table messages, proposals;
