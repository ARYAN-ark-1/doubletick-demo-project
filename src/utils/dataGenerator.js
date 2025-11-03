export const generateContacts = (count) => {
  const firstNames = [
    'John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Tom', 'Anna',
    'Alex', 'Maria', 'Kevin', 'Laura', 'Ryan', 'Nicole', 'Brian', 'Amy', 'Jason', 'Rachel'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];
  
  const domains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.net', 'enterprise.org'
  ];
  
  const addedByList = ['Admin', 'Manager', 'Sales Team', 'Marketing', 'Support', 'HR Department'];
  
  const contacts = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const phone = `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    const score = Math.floor(Math.random() * 100);
    const lastMessageAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString();
    const addedBy = addedByList[Math.floor(Math.random() * addedByList.length)];
    const avatar = `https://i.pravatar.cc/150?img=${(i % 70) + 1}`;
    
    contacts.push({
      id: i + 1,
      name,
      phone,
      email,
      score,
      lastMessageAt,
      addedBy,
      avatar,
    });
  }
  
  return contacts;
};
