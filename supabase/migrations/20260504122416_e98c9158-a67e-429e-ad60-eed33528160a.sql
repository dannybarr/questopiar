insert into storage.buckets (id, name, public) values ('quest-photos', 'quest-photos', true) on conflict (id) do nothing;

create policy "Quest photos public read"
on storage.objects for select
using (bucket_id = 'quest-photos');

create policy "Quest photos anon insert"
on storage.objects for insert
with check (bucket_id = 'quest-photos');

create policy "Quest photos anon delete"
on storage.objects for delete
using (bucket_id = 'quest-photos');