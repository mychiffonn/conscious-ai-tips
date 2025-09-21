document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("tips-container")
  const loading = document.getElementById("loading")
  const categoryFilter = document.getElementById("category-filter")
  const sortBy = document.getElementById("sort-by")
  const tipsCount = document.getElementById("tips-count")

  let allTips = []
  let cardTemplate = ""

  // Load initial data
  try {
    // Get URL params for initial load
    const params = new URLSearchParams(window.location.search)

    const [templateResponse, tipsResponse, allTipsResponse] = await Promise.all([
      fetch("/templates/card.html"),
      fetch("/api/tips?" + params.toString()),
      fetch("/api/tips") // Get all tips for category filter
    ])

    cardTemplate = await templateResponse.text()
    const data = await tipsResponse.json()
    const allTipsData = await allTipsResponse.json()
    allTips = data.tips

    // Populate category filter with all categories
    const categories = [...new Set(allTipsData.tips.map((tip) => tip.category))]
    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      categoryFilter.appendChild(option)
    })

    // Set initial values from URL params
    if (params.get("category")) categoryFilter.value = params.get("category")
    if (params.get("sort")) sortBy.value = params.get("sort")

    loading.style.display = "none"
    renderTips()
  } catch (error) {
    console.error("Error loading tips:", error)
    loading.textContent = "Failed to load tips"
  }

  // Event listeners for filters
  categoryFilter.addEventListener("change", handleFilterChange)
  sortBy.addEventListener("change", handleFilterChange)

  async function handleFilterChange() {
    const category = categoryFilter.value
    const sort = sortBy.value

    // Update URL
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (sort) params.set("sort", sort)

    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "")
    history.pushState({}, "", newUrl)

    // Fetch filtered/sorted data from server
    try {
      const response = await fetch("/api/tips?" + params.toString())
      const data = await response.json()
      allTips = data.tips
      renderTips()
    } catch (error) {
      console.error("Error filtering tips:", error)
    }
  }

  function renderTips() {
    container.innerHTML = ""
    allTips.forEach((tip) => {
      const card = createTipCard(tip, cardTemplate)
      container.appendChild(card)
    })
    
    // Update tips count
    const count = allTips.length
    tipsCount.textContent = `Showing ${count} tip${count !== 1 ? 's' : ''}`
  }
})

function createTipCard(tip, template) {
  // Prepare template data
  const templateData = {
    ...tip,
    ...getSemanticLabels(tip)
  }

  // Parse template with data
  let html = parseTemplate(template, templateData)

  // Create element from template
  const wrapper = document.createElement("div")
  wrapper.innerHTML = html
  const card = wrapper.firstElementChild

  return card
}
