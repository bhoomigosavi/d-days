import { test, expect } from '@playwright/test';

test.describe('MARIS Smoke Tests - Frontend-Verifiable Flows', () => {
  test('App loads at / without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');

    // Check main brand logo and HUD components render
    await expect(page.locator('text=MARIS').first()).toBeVisible();

    // Verify no unhandled page errors occurred
    const relevantErrors = consoleErrors.filter(
      (msg) => !msg.includes('favicon') && !msg.includes('404')
    );
    expect(relevantErrors).toHaveLength(0);
  });

  test('Leaflet map container renders and base tiles load', async ({ page }) => {
    await page.goto('/');

    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // Verify tile pane is attached and CARTO dark matter tiles load
    const tilePane = page.locator('.leaflet-tile-pane');
    await expect(tilePane).toBeAttached();

    await page.waitForSelector('.leaflet-tile-pane img', { timeout: 10000 });
    const tilesCount = await page.locator('.leaflet-tile-pane img').count();
    expect(tilesCount).toBeGreaterThan(0);
  });

  test('Sidebar Upload action opens SARUploadModal', async ({ page }) => {
    await page.goto('/');

    // Verify sidebar Upload button exists and opens SARUploadModal
    const uploadBtn = page.locator('[data-testid="sidebar-tab-upload"]');
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();

    await expect(page.locator('[data-testid="sar-upload-modal"]')).toBeVisible();

    // Close upload modal
    await page.click('[data-testid="sar-close-btn"]');
    await expect(page.locator('[data-testid="sar-upload-modal"]')).not.toBeVisible();
  });

  test('Clicking a spill marker opens IncidentModal with correct incident details', async ({ page }) => {
    await page.goto('/');

    // Seeded mock spill SPILL-IND-01: Mumbai High Sector 4 Offshore Leak
    const spillMarker = page.locator('.marker-SPILL-IND-01');
    await expect(spillMarker).toBeVisible({ timeout: 10000 });

    await spillMarker.click({ force: true });

    // Verify IncidentModal is open and displays the spill name
    const incidentModal = page.locator('[data-testid="incident-modal"]');
    await expect(incidentModal).toBeVisible();

    const modalTitle = page.locator('[data-testid="incident-modal-title"]');
    await expect(modalTitle).toContainText('Mumbai High Sector 4 Offshore Leak');
  });

  test('Clicking Export GeoJSON in IncidentModal triggers a file download with valid GeoJSON FeatureCollection', async ({
    page,
  }) => {
    await page.goto('/');

    // Open incident modal for SPILL-IND-01
    const spillMarker = page.locator('.marker-SPILL-IND-01');
    await expect(spillMarker).toBeVisible({ timeout: 10000 });
    await spillMarker.click({ force: true });

    await expect(page.locator('[data-testid="incident-modal"]')).toBeVisible();

    // Trigger and capture download event
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-geojson-btn"]');
    const download = await downloadPromise;

    // Read download content as text
    const readStream = await download.createReadStream();
    expect(readStream).not.toBeNull();

    const chunks: Buffer[] = [];
    for await (const chunk of readStream!) {
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString('utf-8');

    // Parse and assert valid GeoJSON FeatureCollection
    const parsed = JSON.parse(content);
    expect(parsed).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(parsed.features)).toBe(true);
    expect(parsed.features.length).toBeGreaterThan(0);
    expect(parsed.features[0]).toHaveProperty('geometry');
    expect(parsed.features[0].properties).toHaveProperty('id', 'SPILL-IND-01');
  });

  test('SARUploadModal accepts mock file and progresses through uploading -> processing -> success states', async ({
    page,
  }) => {
    await page.goto('/');

    // Open SAR Upload Modal
    await page.click('[data-testid="sidebar-tab-upload"]');
    await expect(page.locator('[data-testid="sar-upload-modal"]')).toBeVisible();

    // Prepare mock image file buffer
    const mockFilePayload = {
      name: 'sentinel1_test_scene.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock-satellite-sar-raster-bytes'),
    };

    // Set file in input
    await page.setInputFiles('[data-testid="sar-file-input"]', mockFilePayload);

    // Verify file card is visible
    await expect(page.locator('[data-testid="sar-selected-file-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="sar-selected-filename"]')).toContainText(
      'sentinel1_test_scene.png'
    );

    // Click Run SAR AI Slick Segmentation
    await page.click('[data-testid="sar-analyze-btn"]');

    // State 1: Uploading progress
    await expect(page.locator('[data-testid="sar-uploading-state"]')).toBeVisible();

    // State 2: Neural processing state
    await expect(page.locator('[data-testid="sar-processing-state"]')).toBeVisible({
      timeout: 10000,
    });

    // State 3: Success state with AI inference readout
    await expect(page.locator('[data-testid="sar-success-state"]')).toBeVisible({
      timeout: 10000,
    });

    // Verify Plot on Map button is available
    await expect(page.locator('[data-testid="sar-plot-btn"]')).toBeVisible();
  });

  // enable once backend dispatch endpoint exists
  test.skip('Live Coast Guard Dispatch integration with real backend endpoint', async () => {
    // This test is skipped until live POST /api/incidents/:id/dispatch endpoint is connected
  });
});
