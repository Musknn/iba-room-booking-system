// src/features/auth/components/UserTypeSelector.js  // File path indicating user type selection component

import React from 'react'; // Import React library for building UI components

// Define UserTypeSelector functional component and destructure props
const UserTypeSelector = ({ selectedType, onTypeChange }) => {

  // Array defining available user type options
  const userTypeOptions = [

    // Student user type option
    { 
      value: 'student', // Value representing student user type
      label: 'Student' // Label displayed on the button
    },

    // Admin user type option
    { 
      value: 'admin', // Value representing admin user type
      label: 'Admin' // Label displayed on the button
    }
  ];

  // JSX returned by UserTypeSelector component
  return (

    // Wrapper div for user type selection
    <div className="user-type-selector">

      <label>Select User Type:</label>

      <div className="user-type-buttons">

        {userTypeOptions.map((option) => (

          // Button for selecting a specific user type
          <button
            key={option.value} // Unique key for React list rendering
            type="button" // Prevent button from submitting any form
            className={`user-type-btn ${selectedType === option.value ? 'selected' : ''}`} // Apply selected class conditionally
            onClick={() => onTypeChange(option.value)} // Handle user type selection
          >

            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Export UserTypeSelector component for use in other parts of the application
export default UserTypeSelector;
