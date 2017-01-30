# Data

First run `npm install`.

The rest of the process is then divided in to two parts, the importing of data and the generation of graphs, see each section for instructions.

Start with importing the data and then continue with the generation of graphs.

## Import data
[Reference data set with 5000 graphs](https://github.com/Ericsson/eiffel/blob/master/examples/reference-data-sets/default/events.zip) (192484 entries)

Generated_eiffel_events.json contains 5 graphs (213 entries)

### Import script
Usage: node import_data.js [OPTIONS]... FILE DEST
Parses nodes from a json FILE to a DESTination collection.

If the collection exists the content will be dropped.

The json file should be in utf8.

  -m, --mongodb           Mongodb url
  -h, --help              This help text


By default:
  --mongodb=mongodb://localhost:3001/meteor

Example:
```node import_data.js ./generated_eiffel_events.json example2```
Or using npm run-script:
```npm run-script import ./generated_eiffel_events.json example2```


## Generate graphs
Usage: node generate_graphs.js [OPTIONS]... SOURCE
Parses start nodes from a SOURCE collection.

  -m, --mongodb           Mongodb url
  -h, --help              This help text
  -s, --settings          Settings file


By default:
  --mongodb=mongodb://localhost:3001/meteor
  --settings=settings.json

Read more about the settings file in the next section.

__As of now the destination collection must be example3__


Example:
```node generate_graphs.js example2```
Or using npm run-script:
```npm run-script generate example2```

### Settings file

When generating the graphs you must provide a settings file containing a json element.

Example:
```JSON
{
  "startEvent": "EiffelSourceChangeCreatedEvent",
  "disallowedLinks": ["PREVIOUS_VERSION"],
  "layout": "dagre",
  "events":{
    "default": {
      "text": "{meta.type}",
      "name": "{meta.type}",
      "shape": {"shape": "ellipse", "width": 300, "height": 300},
      "color":{
        "default":  "#d0d0d0"
      }
    },
    "EiffelSourceChangeCreatedEvent":{
      "text": "Changes Created\n{meta.version}\n{date>meta.time}\n{data.author.name}\n{data.author.group}",
      "name": "Changes Created",
      "shape": {"shape": "ellipse", "width": 300, "height": 300},
      "color":{
        "default":  "#d0d0d0"
      },
      "identifier": "{listDict>data.customData[name]}"
    },
    "EiffelTestSuiteFinishedEvent": {
      "text": "Test Suite Finished\n{meta.version}\n{date>meta.time}\n{data.outcome.verdict}",
      "name": "Test Suite Finished\n{listDict>data.customData[name]}",
      "shape": {"shape": "ellipse", "width": 300, "height": 300},
      "color":{
        "default":  "#FFFF00",
        "path": "{data.outcome.verdict}",
        "values": {
          "PASSED": "#66FF66",
          "FAILED": "#FF0000"
        }
      },
      "value": "{data.outcome.verdict}",
      "identifier": "{listDict>data.customData[name]}"
    },
  }
}
```

#### startEvent
Must be in the structure.
Specifies the event type the graph starts at

#### disallowedLinks
Contains a list of link types that shall be skipped when generating tha graph.

#### Events
The JSON object must contain a "events" key containing an object with keys for each event type that you want to modify the text or appearance of.
The events object must contain a 'default' key that is used for all events that hasn't a own object.

##### Text
The structure of the object is a "text" field in which it is possible to use values from the data object by using { and } with the data path in between.
For example {data.author.name}.
It also exist some special functions {date> which can be used like this {date>meta.time} and will instead of showing a timestamp show the date and time in the format YYYY-MM-DD HH:MM:SS

##### Name
The structure of the object is a "name" field in which it is possible to use values from the data object that are common to all objects with the same identifier using { and } with the data path in between.
For example {listDict>data.customData[name]}.

###### Special Functions

Table containing implemented functions that can be used in the text field.

| Function | Explanation |
|----|----|
| `{date>` | Converts timestamp to `YYYY-MM-DD HH:MM:SS` |
| `{listDict>` | Looks up value in a list formatted in the following way <pre>"customData": [<br>&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"value": "ActT1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"key": "name"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"value": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;"key": "iteration"<br>&nbsp;&nbsp;}<br>],</pre> <br> Example usage {listDict>path[key]}|


##### Shape
The data structure also needs to contain a key "shape"
The shape is an object with 3 parameters that must exist. The "shape" keys value can be one of the following:

| Shape |
|----|
| ellipse |
| rectangle |
| roundrectangle |
| triangle |
| pentagon |
| hexagon |
| heptagon |
| octagon |
| star |
| diamond |
| vee |
| rhomboid |
| polygon |

The other 2 keys needed are width and height, which both should be integers.

##### Color

The color element.
```JSON
  "color":{
    "default":  "#FFFF00",
    "path": "data.value",
    "values": {
      "SUCCESS": "#66FF66",
      "FAILURE": "#FF0000"
    }
  }
```
The default key is mandatory and the value should be a default color of the event.

It exists a way of depending on a value change the color of an event.
To change color depending on value a path key with the path to the data that should be used when choosing color and a values object with a mapping between values and colors shall be included in the object.

##### Identifier

Optional field.
Used together with the type when aggregating the graph.

##### Value

Optional field.
Used in the aggregation.