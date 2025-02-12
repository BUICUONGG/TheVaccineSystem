// import { useState, useEffect } from 'react';
// import StaffList from '../../../components/StaffList';

// function staffPage() {
//   const [staffMembers, setStaffMembers] = useState([]);

//   useEffect(() => {
//     fetch('/api/staff')
//       .then(response => response.json())
//       .then(data => setStaffMembers(data))
//       .catch(error => console.error('Error fetching staff members:', error));
//   }, []);

//   const handleDelete = (id) => {
//     fetch(`/api/staff/${id}`, { method: 'DELETE' })
//       .then(() => {
//         setStaffMembers(staffMembers.filter(member => member.id !== id));
//       })
//       .catch(error => console.error('Error deleting staff member:', error));
//   };

//   return (
//     <div>
//       <h1>Staff Management</h1>
//       <StaffList staffMembers={staffMembers} onDelete={handleDelete} />
//     </div>
//   );
// }

// export default staffPage;