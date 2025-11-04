const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// List all tables
db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err.message);
    return;
  }
  
  console.log('\n--- TABLES ---');
  tables.forEach((table) => {
    console.log(table.name);
  });

  // For each table, show its structure and contents
  tables.forEach((table) => {
    console.log(`\n--- TABLE: ${table.name} ---`);
    
    // Get table structure
    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
      if (err) {
        console.error(`Error getting ${table.name} structure:`, err.message);
        return;
      }
      
      console.log('Columns:');
      columns.forEach(column => {
        console.log(`  ${column.name} (${column.type})`);
      });
      
      // Get table contents
      db.all(`SELECT * FROM ${table.name} LIMIT 10`, [], (err, rows) => {
        if (err) {
          console.error(`Error getting ${table.name} data:`, err.message);
          return;
        }
        
        console.log(`\nData (up to 10 rows):`);
        rows.forEach(row => {
          console.log(row);
        });
        
        // When on the last table, close the database connection
        if (table.name === tables[tables.length - 1].name) {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Closed the database connection.');
            }
          });
        }
      });
    });
  });
}); 