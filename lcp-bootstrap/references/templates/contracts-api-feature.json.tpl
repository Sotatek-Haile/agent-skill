{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "{Feature Name} Contracts",
  "_updated": "{YYYY-MM-DD}",
  "_comment": "API contract for {feature-id} — {Feature Name}. Fill in actual shapes from BE DTOs and entities.",
  "definitions": {
    "Create{Feature}Request": {
      "type": "object",
      "description": "Request body for creating a {feature} record",
      "properties": {},
      "required": []
    },
    "Update{Feature}Request": {
      "type": "object",
      "description": "Request body for updating a {feature} record",
      "properties": {},
      "required": []
    },
    "Query{Feature}Params": {
      "type": "object",
      "description": "Query parameters for listing {feature} records",
      "properties": {
        "page":   { "type": "integer", "minimum": 1, "default": 1 },
        "limit":  { "type": "integer", "minimum": 1, "maximum": 100, "default": 20 },
        "search": { "type": "string" }
      }
    },
    "{Feature}Response": {
      "type": "object",
      "description": "Full {feature} detail response",
      "properties": {
        "id":        { "type": "number" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      },
      "required": ["id"]
    },
    "{Feature}ListItem": {
      "type": "object",
      "description": "Lightweight {feature} item for list/table views",
      "properties": {
        "id": { "type": "number" }
      },
      "required": ["id"]
    }
  }
}
