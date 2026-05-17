-- Merge Design 2D + Design 3D into a single 'Design' category.
update public.skill_categories
  set label_it = 'Design', label_en = 'Design'
  where slug = 'design-2d';
update public.skills set category = 'design-2d' where category = 'design-3d';
delete from public.skill_categories where slug = 'design-3d';

-- Naming cleanup: proper casing for well-known acronyms / dotted names.
update public.skills set name = 'HTML'    where name = 'Html';
update public.skills set name = 'CSS'     where name = 'Css';
update public.skills set name = 'Next.js' where name = 'Nextjs';
update public.skills set name = 'MySQL'   where name = 'Mysql';
update public.skills set name = 'PHP'     where name = 'Php';
update public.skills set name = 'Node.js' where name = 'Node';

-- Icon upgrades: swap dated 3D-shield devicon assets for flat simpleicons;
-- use Bambu Lab brand logo for 3D Printing (user owns Bambu Lab A1).
update public.skills
  set icon_url = 'https://cdn.simpleicons.org/html5/E34F26',
      icon_dark_url = null, dark = false
  where name = 'HTML';
update public.skills
  set icon_url = 'https://cdn.simpleicons.org/css/663399',
      icon_dark_url = null, dark = false
  where name = 'CSS';
update public.skills
  set icon_url = 'https://cdn.simpleicons.org/bambulab/00AE42',
      icon_dark_url = null, dark = false
  where name = '3D Printing';

-- Compact category positions sequentially after the design-3d delete.
with ordered_cats as (
  select slug, row_number() over (order by position) - 1 as new_pos
  from public.skill_categories
)
update public.skill_categories sc set position = oc.new_pos
from ordered_cats oc where sc.slug = oc.slug;

-- Reorder skills: category position, then percentage desc within category.
with ordered as (
  select s.id,
         row_number() over (
           order by coalesce(c.position, 999), s.percentage desc, s.name
         ) - 1 as new_pos
  from public.skills s
  left join public.skill_categories c on c.slug = s.category
)
update public.skills s set position = o.new_pos from ordered o where s.id = o.id;
