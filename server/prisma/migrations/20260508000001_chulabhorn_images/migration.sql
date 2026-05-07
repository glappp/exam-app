-- Set image paths for Chulabhorn p6 2565 exam questions
UPDATE "Question"
SET image = CASE (attributes->>'questionNo')
  WHEN '004' THEN 'chulabhorn-p6-2565/q04.jpg'
  WHEN '005' THEN 'chulabhorn-p6-2565/q05.jpg'
  WHEN '006' THEN 'chulabhorn-p6-2565/q06.jpg'
  WHEN '007' THEN 'chulabhorn-p6-2565/q07.jpg'
  WHEN '014' THEN 'chulabhorn-p6-2565/q14.jpg'
  WHEN '015' THEN 'chulabhorn-p6-2565/q15.jpg'
  WHEN '016' THEN 'chulabhorn-p6-2565/q16.jpg'
  WHEN '017' THEN 'chulabhorn-p6-2565/q17.jpg'
  WHEN '018' THEN 'chulabhorn-p6-2565/q18.jpg'
  WHEN '020' THEN 'chulabhorn-p6-2565/q20.jpg'
  WHEN '021' THEN 'chulabhorn-p6-2565/q21.jpg'
  WHEN '023' THEN 'chulabhorn-p6-2565/q23.jpg'
  WHEN '025' THEN 'chulabhorn-p6-2565/q25.jpg'
END
WHERE source = 'chulabhorn-p6-2565'
  AND attributes->>'questionNo' IN ('004','005','006','007','014','015','016','017','018','020','021','023','025')
  AND image IS NULL;
