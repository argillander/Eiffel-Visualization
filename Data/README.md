# Data

First run `npm install`.
The process is then divided in to two parts, the importing of data and the generation of graphs, see each section for instructions.

## Import data
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
Usage: node generate_graphs.js [OPTIONS]... SOURCE DEST
Parses start nodes from a SOURCE collection to a DESTination collection of a
 specified type.

  -m, --mongodb           Mongodb url
  -t, --type              Event type as start node.
  -d, --disallowed-links  Disallowed links in structure. Comma separated list
                          without space ex. -d LINK1,LINK2 
  -h, --help              This help text
  -s, --settings          Settings file


By default:
  --mongodb=mongodb://localhost:3001/meteor
  --type=EiffelSourceChangeCreatedEvent
  --disallowed-links=PREVIOUS_VERSION
  --settings=settings.json

Read more about the settings file in the next section.

__As of now the destination collection must be example3__


Example:
```node generate_graphs.js example2 example3```
Or using npm run-script:
```npm run-script generate example2 example3```

### Settings file

When generating the graphs you must provide a settings file containing a json element.

Example:
```JSON
{
  "events":{
    "default": {
      "text": "{meta.type}",
      "shape": "circle",
      "color":{
        "default":  "#d0d0d0"
      }
    },
    "EiffelSourceChangeCreatedEvent":{
      "text": "Changes Created\n{meta.version}\n{date>meta.time}\n{data.author.name}\n{data.author.group}",
      "shape": "circle",
      "color":{
        "default":  "#d0d0d0"
      }
    },
    "EiffelConfidenceLevelModifiedEvent": {
      "text": "Confidence Level\n{meta.version}\n{date>meta.time}\n{data.name}\n{data.value}",
      "shape": "circle",
      "color":{
        "default":  "#FFFF00",
        "path": "data.value",
        "values": {
          "SUCCESS": "#66FF66",
          "FAILURE": "#FF0000"
        }
      }
    }
  }
}
```


#### Events
The JSON object must contain a "events" key containing an object with keys for each event type that you want to modify the text or appearance of.
The events object must contain a 'default' key that is used for all events that hasn't a own object.

##### Text
The structure of the object is a "text" field in which it is possible to use values from the data object by using { and } with the data path in between.
For example {data.author.name}.
It also exist some special functions {date> which can be used like this {date>meta.time} and will instead of showing a timestamp show the date and time in the format YYYY-MM-DD HH:MM:SS

###### Special Functions
 | Function | Explanation |
 |----|----|
 | {date> | Converts timestamp to YYYY-MM-DD HH:MM:SS |

##### Shape
The data structure also needs to contain a key "shape"
The shape value can be one of the following:

| Shape |
|----|
| rect |
| circle |
| ellipse |
| polygon |

##### Color

The last part is the color element.
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

