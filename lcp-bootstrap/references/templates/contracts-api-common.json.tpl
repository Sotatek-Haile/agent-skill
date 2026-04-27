{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Common API Types",
  "_updated": "{YYYY-MM-DD}",
  "definitions": {
    "ApiResponse": {
      "type": "object",
      "description": "Standard API envelope — backend interceptor wraps every response in this shape",
      "properties": {
        "success": { "type": "boolean" },
        "message": { "type": "string" },
        "data":    { "description": "Payload — concrete type depends on the endpoint" },
        "meta":    { "$ref": "#/definitions/PageMeta" }
      },
      "required": ["success"]
    },
    "PageMeta": {
      "type": "object",
      "description": "Pagination metadata — present on list endpoints",
      "properties": {
        "page":       { "type": "integer", "minimum": 1 },
        "limit":      { "type": "integer", "minimum": 1 },
        "total":      { "type": "integer", "minimum": 0 },
        "totalPages": { "type": "integer", "minimum": 0 }
      },
      "required": ["page", "limit", "total", "totalPages"]
    },
    "PageQueryParams": {
      "type": "object",
      "description": "Standard pagination query parameters",
      "properties": {
        "page":      { "type": "integer", "minimum": 1, "default": 1 },
        "limit":     { "type": "integer", "minimum": 1, "maximum": 100, "default": 20 },
        "search":    { "type": "string" },
        "direction": { "type": "string", "enum": ["ASC", "DESC"], "default": "DESC" }
      }
    },
    "DateRangeFilter": {
      "type": "object",
      "description": "Date range filter — ISO 8601 date-time strings",
      "properties": {
        "from": { "type": "string", "format": "date-time" },
        "to":   { "type": "string", "format": "date-time" }
      }
    }
  }
}
