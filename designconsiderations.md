Design considerations:
======================
1. Wildcard table name with REGEXP doesn't work because the prefix matches the table names of `green_trips_2018` and `yellow_trips_2018`, which do not contain the columns "`pickup_latitude`" and "`pickup_longitude`"

    >```
    SELECT
    ...
    FROM
        `bigquery-public-data.new_york_taxi_trips.tlc_*`
    WHERE
        REGEXP_CONTAINS(_TABLE_SUFFIX, r'((green_trips_201[4-7])|(yellow_trips_201[5-7]))')
    ```
2. Null Values and Invalid values<P>
There are some rows where some columns in `trip_distance`, `fare_amount`, `dropoff_datetime` or the `longitude/latitude` are NULL. I exclude any rows where any of those columns contain a `NULL` value to ensure the endpoints are returning results based on the same consistent set of taxi trips. However, if I do that, tables in 2017 will be completely empty. If approximation is acceptable, I will include the rows as long as they contain either valid set of columns in [`longitude/latitude`, `fare_amount`] or valid set of columns in [`trip_distance`, `dropoff_datetime`]. However, because the API required does not support specify if approximation is expected, I would rather not surprise the user.<br>
Some of the columns have only a certain valid range of values, thus the following filters are put in place:
    >```
    WHERE
        (pickup_datetime < dropoff_datetime)
        AND
        (pickup_latitude BETWEEN -90 AND 90)
        AND
        (pickup_longitude BETWEEN -180 AND 180)
        AND
        (fare_amount > 0)
        AND
        (trip_distance > 0)
    ```
On top of the usual valid range of values, I noticed that some of the pickup_datetime appears to not belong to the year indicated by the table name(i.e. tlc_green_trips_2017 containing `MIN(pickup_datetime)` of the year 2008). Hence, I also filtered out the pickup_datetime with year that doesn't match the table name.

3. Because the ST_GEOHASH function in bigquery is not implemented using S2 geometry, I needed to use a javascript UDF to do the hashing. <br>
I found [one](https://github.com/CartoDB/bigquery-jslibs) already implemented and the source was very similar to the [npm registry's javascript port](https://www.npmjs.com/package/s2-geometry).<br>
The javascript UDF slows down the SQL operation by a lot, but since we only need to run this once, it should be fine.<p>
In this case, the requirement is to group the location by level 16 s2 id. Because BigQuery does not support unsigned 64 bit integers(cannot store the id 2^64-1), I stored and clustered the locations by using their s2 key instead of id. This will allow the cluster to be more efficient in case we want to group by a higher level of s2(< level 16). We can do that by using `SUBSTR`(e.g. `SUBSTR(level30_key, 1, 12)` to group them by level 10). One consideration is that I can also create level 30 s2 keys instead, then we can just use substrings of the level 30 s2 key. i.e. `SUBSTR(level30_key, 1, 18)` to get the level 16 keys. This will avoid expensive recomputation if we need other to group by the deeper levels.