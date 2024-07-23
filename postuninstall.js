try {
  console.log('Running postuninstall script...');
  // Add your cleanup logic here
  console.log('Postuninstall script completed.');
} catch (error) {
  console.error('Error running postuninstall script:', error);
}
