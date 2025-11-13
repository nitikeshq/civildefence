// Export utilities for Excel and CSV

import type { Volunteer, Incident, InventoryItem } from "@shared/schema";

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert to CSV
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Escape commas and quotes
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    ),
  ].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadExcel(data: any[], filename: string) {
  // For now, use CSV format with .xlsx extension
  // In production, you'd use a library like xlsx or exceljs
  downloadCSV(data, filename);
}

export function prepareVolunteersForExport(volunteers: Volunteer[]) {
  return volunteers.map((v) => ({
    "Full Name": v.fullName || "",
    Email: v.email || "",
    Phone: v.phone || "",
    District: v.district || "",
    Status: v.status || "",
    "Date of Birth": v.dateOfBirth || "",
    Address: v.address || "",
    "Ex-Serviceman": v.isExServiceman ? "Yes" : "No",
    "Service History": v.serviceHistory || "",
    Skills: v.skills?.join(", ") || "",
    Qualifications: v.qualifications || "",
    "Emergency Contact": v.emergencyContact || "",
    "Emergency Phone": v.emergencyPhone || "",
    "Created At": v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "",
  }));
}

export function prepareIncidentsForExport(incidents: Incident[]) {
  return incidents.map((i) => ({
    Title: i.title || "",
    Description: i.description || "",
    Location: i.location || "",
    District: i.district || "",
    Severity: i.severity || "",
    Status: i.status || "",
    "Reported By": i.reportedBy || "",
    "Created At": i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "",
  }));
}

export function prepareInventoryForExport(inventory: InventoryItem[]) {
  return inventory.map((item) => ({
    Name: item.name || "",
    Description: item.description || "",
    Category: item.category || "",
    Quantity: item.quantity || 0,
    Condition: item.condition || "",
    Location: item.location || "",
    District: item.district || "",
    "Last Inspection": item.lastInspection
      ? new Date(item.lastInspection).toLocaleDateString()
      : "",
  }));
}
