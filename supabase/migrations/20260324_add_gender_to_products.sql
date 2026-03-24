alter table public.products
add column if not exists gender text
check (gender in ('male', 'female', 'unisex'));

update public.products
set gender = coalesce(gender, 'unisex');

alter table public.products
alter column gender set default 'unisex';

alter table public.products
alter column gender set not null;
