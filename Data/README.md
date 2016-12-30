# Data

First run `npm install`.

## Import data
Usage: node import_data.js [OPTIONS]... FILE DEST
Parses start nodes from a json FILE to a DESTination collection.

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


By default:
  --mongodb=mongodb://localhost:3001/meteor
  --type=EiffelSourceChangeCreatedEvent
  --disallowed-links=PREVIOUS_VERSION


Example:
```node generate_graphs.js example2 example3```
Or using npm run-script:
```npm run-script generate example2 example3```
