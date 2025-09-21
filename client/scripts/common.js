function getSemanticLabel(type, value) {
  const labels = {
    impact: ["None", "Low", "Medium", "High"],
    effort: ["None", "Low", "Medium", "High"],
    cost: ["Free", "Low", "Medium", "High"]
  }

  return labels[type][value] || "Unknown"
}

function getSemanticLabels(tip) {
  return {
    impact_semantic: getSemanticLabel("impact", tip.impact),
    effort_semantic: getSemanticLabel("effort", tip.effort),
    cost_semantic: getSemanticLabel("cost", tip.cost)
  }
}

function getCategorySlug(category) {
  return category.toLowerCase().replace(/\s+/g, "-")
}

function parseTemplate(template, data) {
  let html = template

  // Replace template variables {{key}}
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g")
    html = html.replace(regex, value)
  }

  // Handle conditional sections {{#key}}...{{/key}} - show if key exists and is truthy
  html = html.replace(
    /{{#(\w+)}}([\s\S]*?){{\/\1}}/g,
    (match, key, content) => {
      return data[key] ? content : ""
    }
  )

  return html
}
