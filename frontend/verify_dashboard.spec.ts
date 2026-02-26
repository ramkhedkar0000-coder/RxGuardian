import { test, expect } from '@playwright/test';

test('verify refill alerts dashboard', async ({ page }) => {
  // Mock the /api/refill-alerts endpoint
  await page.route('**/api/refill-alerts', async route => {
    const json = [
      {
        patient_id: 'P001',
        medication: 'Metformin',
        last_order_date: '2023-01-01',
        days_since_last_order: 30,
        days_supply: 20,
        dosage_frequency: 'Once daily',
        recommendation: 'Overdue'
      },
      {
        patient_id: 'P002',
        medication: 'Lisinopril',
        last_order_date: '2023-01-15',
        days_since_last_order: 10,
        days_supply: 30,
        dosage_frequency: 'Once daily',
        recommendation: 'Monitor'
      }
    ];
    await route.fulfill({ json });
  });

  // Navigate to the dashboard
  await page.goto('http://localhost:3000/admin/dashboard');

  // Wait for the stats to load
  await expect(page.locator('.stat-card-value').first()).not.toHaveText('');

  // Take a screenshot
  await page.screenshot({ path: 'verification.png', fullPage: true });
});
