# SWC plugin to convert cjs to esm [Experiment]

> Work in Progress

This is an experiment to convert CommonJS module to ESM module. It is slippery slope with many gotchas but the intention is to make it work for day-to-day used packages.

The plugin is using multi-pass approche, traversing AST multiple times, not good for performance. The initial _attempt is to make it work_ and not focussing on performance, code quality etc.

## Stretegy for react/index.js

react/index.js is very small file, and easier to convert :)

### Source

```javascript
"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/react.production.min.js");
} else {
  module.exports = require("./cjs/react.development.js");
}
```

### 1. Remove `"use strict"`

```javascript
if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/react.production.min.js");
} else {
  module.exports = require("./cjs/react.development.js");
}
```

### 2. Replace `process.env.NODE_ENV` with build target `"production"` or `"development"`

```javascript
if ("production" === "production") {
  module.exports = require("./cjs/react.production.min.js");
} else {
  module.exports = require("./cjs/react.development.js");
}
```

### 3. Evaluate static `BinaryExpression` e.g. if `"production" === "production"` then replace it with `true`

```javascript
if (true) {
  module.exports = require("./cjs/react.production.min.js");
} else {
  module.exports = require("./cjs/react.development.js");
}
```

### 4. Evaluate `IfStatement` for `BooleanLiteral` and omit unreachable code

```javascript
module.exports = require("./cjs/react.production.min.js");
```

### 5. Remove top level IIFE wrapper

Not applicable

### 6. Convert pattern `module.exports = require('...');` to `export * from "..."`

```javascript
export * from "./cjs/react.production.min.js";
```

> Other steps not applicable to react/index.js

## Stretegy for react/cjs/react.development.js

```javascript
'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
  })();
}

```

### 1. Remove `"use strict"`

```javascript
if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
  })();
}
```

### 2. Replace `process.env.NODE_ENV` with build target `"production"` or `"development"`

```javascript
if ("development" !== "production") {
  (function() {
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
  })();
}
```

### 3. Evaluate static `BinaryExpression` e.g. if `"production" === "production"` then replace it with `true`

```javascript
if (true) {
  (function() {
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
  })();
}
```

### 4. Evaluate `IfStatement` for `BooleanLiteral` and omit unreachable code

```javascript

  (function() {
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
  })();

```

### 5. Remove top level IIFE wrapper

```javascript
'use strict';

var _assign = require('object-assign');

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
```

### 6. Convert pattern `module.exports = require('...');` to `export * from "..."`

Not applicable

### 7. Convert require to import

```javascript
'use strict';

import _assign from 'object-assign';

var ReactVersion = '17.0.2';

...
...
...


exports.version = ReactVersion;
```

TBD
