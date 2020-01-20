+++
title= "MSSQL Pivot"
date= 2018-09-25
publishDate= 2018-09-25
archives= "2018"
tags= ["MSSQL"]
+++
Pivots (turning a column's values into actual columns) is a very common activity. Spreadsheet programs have robust support for it. But Standard SQL? Not so much.

### The Problem

```
Create Table orders (
  orderNumber int,
  sku char(3),
  quantity int,
  salesPerson varchar(10)
);

insert into orders values
( 1, 'ZR34', 2, 'Mary'),
( 1, 'AS99', 1, 'Mary'),
( 2, 'ZR34', 1, 'Jim'),
( 2, 'MB01', 1, 'Jim');
```

The ubiquitous order table with the SKU, quantity and sales person. To keep this simple, I did not normalize. If that bothers you, then think of the orders table as the results of joining between the all the bits.

The ask, is to product a report that shows, for each sales persons, how many of each SKU they sold.

```
sku	Mary	Jim	Kiki
AS99	1	0       0
MB01	0       1	0
ZR34	2	1	0
```

(Kiki was apparently on vacation.)

Now if your most people, you download the data to a spreadsheet and call it a day. But we're not most people. We have a hammer (SQL) so we are going to hammer this flat. Plus, we know that we'll get the same request next week, and the next, etc. And who has time for that?

## Standard SQL

If we were to do this in standard SQL, it would look like:

```
select sku, sum([Mary]) as "Mary", sum([Jim]) as "Jim",
        sum([Kiki]) as "Kiki"
from (
   select
      sku,
      case when salesPerson = 'Jim' then quantity else 0 end as [Jim],
      case when salesPerson = 'Mary' then quantity else 0 end as [Mary],
      case when salesPerson = 'Kiki' then quantity else 0 end as [Kiki]
   from orders
   ) as bySP
group by bySP.sku
```

A new case statement is required for every salesperson. That's no fun.

## MSSQL

MSSQL has a pivot  statement that makes this a bit less painful

```
select sku, [Mary], [Jim], [Kiki]
from (select sku, quantity, salesPerson from orders) s
pivot (sum(quantity) for salesPerson in ( [Mary], [Jim], [Kiki])) pvt
```

Some notes about the syntax:

* The alias for the pivot (eg `pvt`) is required.
* The alias for the subselect is also required, even though  it isn't used.
* The values that form the in-list are **not** strings - they are column names.
* You **can** use * in the outer select's return list.

You can use a bare table in the from clause, but be careful. Any column (like `sku`) that is not aggregated or used as the pivot column becomes a defacto group-by. In our example `orderNumber` becomes another row label

```
select *
from orders
pivot (sum(quantity) for salesPerson in ( [Mary], [Jim], [Kiki])) pvt
```

Leading to:

```
orderNumber	sku	Mary	Jim	Kiki
1	        AS99	1	NULL	NULL
2	        MB01	NULL	1	NULL
1	        ZR34	2	NULL	NULL
2	        ZR34	NULL	1	NULL
```

It would be nice if we could do something like this:

```
-- THIS DOESN'T WORK
select *
from (select sku, quantity, salesPerson from orders) s
pivot sum(quantity)
for salesPerson in ( select distinct salesPerson from orders ) as pt
```

But unfortunately, the list of values needs to be given explicitly. The one good thing about this is that you will have a column for a value, even if there is no rows that match (think of poor Kiki).

### Dynamic SQL

But this can be done using Dynamic SQL and exec. I've built dynamic queries such as this for the standard sql case and it is no fun. Doing so for the pivot operator is a piece of cake.

First create a `salesForce` table so Kiki will make an appearance.

```
create table salesForce(
	name varchar(10)
);

insert into salesForce values ('Kiki'), ('Mary'), ('Jim')
```

Then use a cursor to build our column list and presto!

```
declare sp cursor for select [name] from salesForce
declare @list varchar(500) = ''
declare @query varchar(1000)
declare @aName varchar(10)

open sp
Fetch next from sp into @aName
while @@FETCH_STATUS = 0
begin
	if @list != ''
		set @list = @list + ', '

	set @list = @list + '[' + @aName + ']'
	fetch next from sp into @aName
end

close sp
deallocate sp

set @query = 'select sku, ' + @list +
	' from (select sku, quantity, salesPerson from orders) s ' +
	'pivot (sum(quantity) for salesPerson in (' + @list + ')) pvt'

print @query
exec(@query)
```

Unfortunately, to get rid of the nulls means keeping two parallel list - one for the select that has the `isnull` and one for the pivot value list.

I hope this helps you use the pivot statement effectively.
