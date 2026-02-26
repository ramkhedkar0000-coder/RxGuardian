const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Mock the API response
  await page.route('**/api/refill-alerts', async route => {
    const json = [
      {
        patient_id: 'P001',
        medication: 'Metformin',
        last_order_date: '2023-01-01T00:00:00.000Z',
        days_since_last_order: 30,
        days_supply: 20,
        dosage_frequency: 'Once daily',
        recommendation: 'Overdue'
      },
      {
        patient_id: 'P002',
        medication: 'Lisinopril',
        last_order_date: '2023-01-15T00:00:00.000Z',
        days_since_last_order: 10,
        days_supply: 30,
        dosage_frequency: 'Once daily',
        recommendation: 'Monitor'
      }
    ];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(json)
    });
  });

  try {
    await page.goto('http://localhost:3000/admin/dashboard');

    // Wait for the table to populate
    await page.waitForSelector('.table-row');

    // Take screenshot
    await page.screenshot({ path: 'verification.png', fullPage: true });
    console.log('Screenshot saved to verification.png');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
