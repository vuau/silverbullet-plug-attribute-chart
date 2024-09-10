
# SilverBullet plug: attribute chart 

This plug allows you to create a chart from attribute data.

Widget example:

```
```attributeChart  
query:  
  page where name =~ /^Journal\/Day\// 
attributes:  
  - name: hoursOfExercise  
    type: line  
    label: Hours Of Exercise
  - name: mood  
    type: line
    label: Mood Score
```
![LvXflvwEuJ](https://github.com/user-attachments/assets/21a0090d-1f53-4380-9c1c-418c3438948f)

Install this plug: run command "Plug: Add" and add the following URL
```
github:vuau/silverbullet-plug-attribute-chart/attributeChart.plug.js
```

then, run `Plugs: Update` command.
