document.addEventListener("DOMContentLoaded", async function () {
  const loading = document.getElementById("loading")
  const detailContainer = document.getElementById("tip-detail")

  // Extract tip ID from URL path
  const tipId = window.location.pathname.substring(1) // Remove leading slash

  if (!tipId) {
    window.location.href = "/"
    return
  }

  try {
    // Load template and tip data
    const [templateResponse, tipResponse] = await Promise.all([
      fetch("/templates/detail.html"),
      fetch(`/api/tips/${tipId}`)
    ])

    if (!tipResponse.ok) {
      throw new Error(`HTTP ${tipResponse.status}`)
    }

    const template = await templateResponse.text()
    const tip = await tipResponse.json()

    // Update page title
    document.title = `AI Usage Tip: ${tip.title}`

    renderTipDetail(tip, template)

    loading.style.display = "none"
    detailContainer.style.display = "block"
  } catch (error) {
    console.error("Error loading tip:", error)
    loading.textContent = "Tip not found"
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }
})

function renderTipDetail(tip, template) {
  const container = document.getElementById("tip-detail")

  // Prepare template data
  const templateData = {
    ...tip,
    ...getSemanticLabels(tip),
    category_slug: getCategorySlug(tip.category)
  }

  // Handle implementation steps for template
  if (tip.implementation_steps) {
    templateData.implementation_steps = true
    templateData.steps = tip.implementation_steps
  }

  // Parse template with data
  let html = parseTemplate(template, templateData)

  // Handle implementation steps rendering (since we need to loop)
  if (tip.implementation_steps) {
    const stepsHtml = tip.implementation_steps
      .map((step) => `<li>${step}</li>`)
      .join("")
    html = html.replace(/{{#steps}}[\s\S]*?{{\/steps}}/g, stepsHtml)
  }

  container.innerHTML = html
}
