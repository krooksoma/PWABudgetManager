let db;
let StorageVersion;
// opening the indexedDB named 'StoragerDB', version 1
const request = indexedDB.open("StorageDB", StorageVersion || 1);

// checking for newer versions of the indexedDB
request.onupgradeneeded = (event) => {
  console.log(`New upgraded version available for the current IndexedDB`);
  // denstructing older version
  db = event.target.result;
  const { olderVersion } = event;
  const upgradedVersion = event.upgradedVersion || db.version;

  console.log(
    `IndexedDB upgraded from version ${olderVersion} to new version ${upgradedVersion}`
  );

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

// handling error
request.onerror = (event) => {
  console.log(`🔴 Error occurred. Error Code: ${event.target.errorCode}`);
};

function checkDatabase() {
  console.log(`check indexedDB invoked!!`);
  // open a transaction to Budget store with the ability to read and write
  let transaction = db.transaction(["BudgetStore"], "readwrite");

  const store = transaction.objectStore("BudgetStore");

  const getAll = store.getAll();
console.log("GET ALL INVOKED: ", getAll)
  getAll.onsuccess = () => {
      
    if (getAll.result.length > 0) {
        console.log("getAll data: ", getAll.result)
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");

            const currentStore = transaction.objectStore("BudgetStore");

            currentStore.clear();
            console.log("BudgetStore Cleared");
          }
        });
    }
  };
}

// handling success request\
request.onsuccess = function (event) {
  console.log(`Succesfully connected`);
  db = event.target.result;

  // checking if application is online before connecting to db
  if (navigator.online) {
    console.log(`🟢 Backend route online!!`);
    // call function to checkDB
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  // Access your BudgetStore object store
  const store = transaction.objectStore("BudgetStore");

  // Add record to your store with add method.
  store.add(record);
};

window.addEventListener("online", checkDatabase);
