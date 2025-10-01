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

  // Parse template with data
  let html = parseTemplate(template, templateData)

  // Convert markdown-style content to HTML
  if (tip.content) {
    const contentHtml = tip.content
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^\s*(<li>.*<\/li>\s*)+$/gm, '<ol>$&</ol>')
      .replace(/^(?!<[h\d]|<ol|<\/p>)(.+)$/gm, '<p>$1</p>')
    
    html = html.replace('{{content}}', contentHtml)
  }

  container.innerHTML = html
}
