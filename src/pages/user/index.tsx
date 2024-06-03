import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import { IUser } from "./interface";

export function UserComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Replace 'your-api-url' with the actual API endpoint
    axiosInstance
      .get(config.user.allUsers())
      .then((response) => {
        setUsers(response.data?.dataSource);
      })
      .catch((error) => {
        console.error("Error fetching the user data:", error);
      });
  }, []);

  return (
    <Table>
      <TableCaption>A list of users fetched from the API.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile Number</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: IUser) => (
          <TableRow key={user.id}>
            <TableCell className='font-medium'>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.mobile_number}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total Users: {users.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
