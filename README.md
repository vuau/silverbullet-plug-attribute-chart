
# SilverBullet plug: attribute chart 

This plug allows you to create a chart from attribute data.

Widget example:

```
```attributeChart  
query:  
  page where name =~ /^Journal\/Day\// order by displayName desc  
attributes:  
  line1:  
    name: exercised  
    type: line  
  line2:  
    name: mood  
    type: line
```

Install this plug: run command "Plug: Add" and add the following URL
```
github:vuau/silverbullet-plug-attribute-chart/attributeChart.plug.js
```

then, run `Plugs: Update` command.
