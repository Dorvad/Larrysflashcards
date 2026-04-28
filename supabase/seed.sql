-- Seed data for local development and demos.
-- Run after schema.sql.

-- Sample word sets
insert into public.word_sets (id, name, description, color, sort_order)
values
  ('11111111-0000-0000-0000-000000000001', 'Greetings', 'Everyday hellos and goodbyes', '#1a6fd4', 0),
  ('11111111-0000-0000-0000-000000000002', 'Family', 'Family members', '#4d7f4a', 1),
  ('11111111-0000-0000-0000-000000000003', 'Numbers', 'Numbers 1–10', '#c8853a', 2);

-- Sample words
insert into public.words (hebrew, transliteration, english, notes, word_set_id, sort_order)
values
  ('שָׁלוֹם',   'shalom',    'peace / hello / goodbye', 'The all-purpose greeting',          '11111111-0000-0000-0000-000000000001', 0),
  ('בֹּקֶר טוֹב', 'boker tov', 'good morning',            'Lit. "good morning"',               '11111111-0000-0000-0000-000000000001', 1),
  ('לַיְלָה טוֹב', 'layla tov', 'good night',             'Said at bedtime',                   '11111111-0000-0000-0000-000000000001', 2),
  ('תּוֹדָה',    'toda',      'thank you',               'Toda raba = thank you very much',  '11111111-0000-0000-0000-000000000001', 3),
  ('בְּבַקָּשָׁה', 'bevakasha', 'please / you''re welcome', 'Works both ways!',                 '11111111-0000-0000-0000-000000000001', 4),

  ('אַבָּא',    'aba',       'father / dad',   null, '11111111-0000-0000-0000-000000000002', 0),
  ('אִמָּא',    'ima',       'mother / mum',   null, '11111111-0000-0000-0000-000000000002', 1),
  ('אָח',       'ach',       'brother',        null, '11111111-0000-0000-0000-000000000002', 2),
  ('אָחוֹת',    'achot',     'sister',         null, '11111111-0000-0000-0000-000000000002', 3),

  ('אֶחָד',    'echad',     'one',   null, '11111111-0000-0000-0000-000000000003', 0),
  ('שְׁנַיִם', 'shnaim',    'two',   null, '11111111-0000-0000-0000-000000000003', 1),
  ('שָׁלוֹשׁ',  'shalosh',   'three', null, '11111111-0000-0000-0000-000000000003', 2),
  ('אַרְבַּע',  'arba',      'four',  null, '11111111-0000-0000-0000-000000000003', 3),
  ('חָמֵשׁ',   'chamesh',   'five',  null, '11111111-0000-0000-0000-000000000003', 4);
