insert into "users" (
  "userName",
  "userNumber",
  "userPassword",
  "userRole"
) values (
  'Meet Patel',
  '111',
  '$argon2i$v=19$m=4096,t=3,p=1$CQ/I2OSH+N9okHCtXhAOzA$JahNbJtNC6cWCzm9aNgaoZSA0UYQzLlYRKz8U6xPSNc',
  'Admin'
), (
  'test',
  '222',
  '$argon2i$v=19$m=4096,t=3,p=1$CQ/I2OSH+N9okHCtXhAOzA$JahNbJtNC6cWCzm9aNgaoZSA0UYQzLlYRKz8U6xPSNc',
  'Customer'
);
insert into "tables" (
  "tableNumber"
) values (
  '1'
), (
  '2'
), (
  '3'
), (
  '4'
), (
  '5'
), (
  '6'
), (
  '7'
), (
  '8'
), (
  '9'
), (
  '10'
), (
  '11'
), (
  '12'
), (
  '13'
), (
  '14'
), (
  '15'
);

update "tables" set "userId"=2 where "tableNumber"=7
