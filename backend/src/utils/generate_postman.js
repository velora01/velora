import fs from "fs";
import path from "path";

const collection = {
  info: {
    name: "Velora Full Backend CRM",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description: "Complete test cases for all Velora CRM & Customer Portal backend APIs, including automated scripts for extracting tokens and OTPs."
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000/api", type: "string" },
    { key: "adminToken", value: "", type: "string" },
    { key: "customerToken", value: "", type: "string" },
    { key: "customerOtp", value: "", type: "string" },
    { key: "testLeadId", value: "", type: "string" },
    { key: "testCustomerId", value: "", type: "string" }
  ],
  item: [
    {
      name: "1. Staff & General Authentication",
      item: [
        {
          name: "POST /auth/register (Staff/User Registration)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "New Sales Staff",
                email: "newsales@veloradesigns.com",
                password: "salespassword123",
                role: "Sales"
              })
            },
            url: "{{baseUrl}}/auth/register"
          }
        },
        {
          name: "POST /auth/register-admin",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "New Admin User",
                email: "newadmin@veloradesigns.com",
                password: "newadminpassword"
              })
            },
            url: "{{baseUrl}}/auth/register-admin"
          }
        },
        {
          name: "POST /auth/login (Admin)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "admin@veloradesigns.com",
                password: "adminpassword"
              })
            },
            url: "{{baseUrl}}/auth/login"
          },
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data && res.data.accessToken) {",
                  "    pm.collectionVariables.set('adminToken', res.data.accessToken);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          name: "POST /auth/login (Sales)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "sales@veloradesigns.com",
                password: "salespassword"
              })
            },
            url: "{{baseUrl}}/auth/login"
          }
        },
        {
          name: "POST /auth/refresh-token",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                refreshToken: "{{adminToken}}"
              })
            },
            url: "{{baseUrl}}/auth/refresh-token"
          }
        },
        {
          name: "POST /auth/forgot-password",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "admin@veloradesigns.com"
              })
            },
            url: "{{baseUrl}}/auth/forgot-password"
          }
        },
        {
          name: "POST /auth/reset-password",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                token: "some-token",
                password: "newadminpassword"
              })
            },
            url: "{{baseUrl}}/auth/reset-password"
          }
        },
        {
          name: "POST /auth/change-password",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                oldPassword: "adminpassword",
                newPassword: "adminpassword"
              })
            },
            url: "{{baseUrl}}/auth/change-password"
          }
        },
        {
          name: "POST /auth/logout",
          request: {
            method: "POST",
            url: "{{baseUrl}}/auth/logout"
          }
        }
      ]
    },
    {
      name: "2. Customer Portal Authentication",
      item: [
        {
          name: "POST /customer/register (Client/Customer Self-Registration)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "New Self Registered Customer",
                phone: "+91 99999 55555",
                email: "newcustomer.self@example.com",
                address: "Kothrud, Pune",
                occupation: "Architectural Lead",
                budget: "10-20L",
                password: "customerpass123"
              })
            },
            url: "{{baseUrl}}/customer/register"
          }
        },
        {
          name: "POST /customer/login",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                loginId: "rohan.sharma@example.com",
                password: "customerpassword"
              })
            },
            url: "{{baseUrl}}/customer/login"
          },
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data && res.data.testOtp) {",
                  "    pm.collectionVariables.set('customerOtp', res.data.testOtp);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          name: "POST /customer/verify-otp",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                loginId: "rohan.sharma@example.com",
                otp: "{{customerOtp}}"
              })
            },
            url: "{{baseUrl}}/customer/verify-otp"
          },
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data && res.data.accessToken) {",
                  "    pm.collectionVariables.set('customerToken', res.data.accessToken);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          name: "POST /customer/logout",
          request: {
            method: "POST",
            url: "{{baseUrl}}/customer/logout"
          }
        }
      ]
    },
    {
      name: "3. User & Customer Profiles",
      item: [
        {
          name: "GET /profile (Staff)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/profile"
          }
        },
        {
          name: "GET /profile (Customer)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{customerToken}}" }],
            url: "{{baseUrl}}/profile"
          }
        },
        {
          name: "PUT /profile (Customer)",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{customerToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Rohan Sharma Updated",
                occupation: "Lead Software Architect",
                address: "Flat 402, Oberoi Splendor, Mumbai (Home Address)"
              })
            },
            url: "{{baseUrl}}/profile"
          }
        }
      ]
    },
    {
      name: "4. Lead Management (Staff Access)",
      item: [
        {
          name: "POST /leads (Create Lead)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Varun Joshi",
                phone: "+91 9898989898",
                email: "varun.joshi@example.com",
                source: "Google",
                projectCategory: "Full Home Interior",
                budget: "10-20L",
                notes: "Wants premium false ceiling design and kitchen cabinet renovations."
              })
            },
            url: "{{baseUrl}}/leads"
          },
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data && res.data._id) {",
                  "    pm.collectionVariables.set('testLeadId', res.data._id);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          name: "GET /leads (All Leads)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/leads"
          }
        },
        {
          name: "GET /leads/:id",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/leads/{{testLeadId}}"
          }
        },
        {
          name: "PUT /leads/:id (Update)",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                status: "Negotiation",
                notes: "Client negotiating on material cost sheets."
              })
            },
            url: "{{baseUrl}}/leads/{{testLeadId}}"
          }
        },
        {
          name: "POST /leads/assign",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                leadId: "{{testLeadId}}",
                userId: "replace-with-designer-user-id"
              })
            },
            url: "{{baseUrl}}/leads/assign"
          }
        },
        {
          name: "POST /leads/convert (Convert to Customer)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                leadId: "{{testLeadId}}",
                address: "Viman Nagar, Pune",
                occupation: "Venture Capitalist",
                houseType: "3BHK Villa",
                flatNumber: "Villa 3",
                password: "varunpassword"
              })
            },
            url: "{{baseUrl}}/leads/convert"
          },
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "const res = pm.response.json();",
                  "if (res.success && res.data && res.data.customer) {",
                  "    pm.collectionVariables.set('testCustomerId', res.data.customer._id);",
                  "}"
                ]
              }
            }
          ]
        },
        {
          name: "DELETE /leads/:id",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/leads/{{testLeadId}}"
          }
        }
      ]
    },
    {
      name: "5. Customer Management CRUD (Staff Access)",
      item: [
        {
          name: "POST /customers (Create Customer)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Sneha Patil",
                phone: "+91 9988776655",
                email: "sneha.patil@example.com",
                address: "Baner, Pune",
                occupation: "Graphic Designer",
                houseType: "2BHK Apartment",
                password: "snehapassword"
              })
            },
            url: "{{baseUrl}}/customers"
          }
        },
        {
          name: "GET /customers",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/customers"
          }
        },
        {
          name: "GET /customers/search",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/customers/search?q=Sneha"
          }
        },
        {
          name: "GET /customers/:id",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/customers/{{testCustomerId}}"
          }
        },
        {
          name: "PUT /customers/:id",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                occupation: "Creative Director"
              })
            },
            url: "{{baseUrl}}/customers/{{testCustomerId}}"
          }
        },
        {
          name: "DELETE /customers/:id",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/customers/{{testCustomerId}}"
          }
        }
      ]
    },
    {
      name: "6. Customer Portal Features",
      item: [
        {
          name: "GET /customers/project (Associated Project Details)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{customerToken}}" }],
            url: "{{baseUrl}}/customers/project"
          }
        },
        {
          name: "GET /customers/dashboard (Timeline & Staff Info)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{customerToken}}" }],
            url: "{{baseUrl}}/customers/dashboard"
          }
        }
      ]
    },
    {
      name: "7. CRM & Client Portal Modules (Fully Integrated)",
      item: [
        {
          name: "GET /company (Company Info)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/company"
          }
        },
        {
          name: "GET /website-cms (CMS Configuration)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/website-cms"
          }
        },
        {
          name: "GET /timeline (Project Status)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/timeline"
          }
        },
        {
          name: "POST /timeline (Create Milestone)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "False Ceiling Installation",
                status: "Pending",
                date: "2026-08-10",
                comments: "Scheduled post electrical wiring approval."
              })
            },
            url: "{{baseUrl}}/timeline"
          }
        },
        {
          name: "GET /tasks (Retrieve checklist)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/tasks"
          }
        },
        {
          name: "POST /tasks (Create task checklist)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Confirm electrical wiring drawings"
              })
            },
            url: "{{baseUrl}}/tasks"
          }
        },
        {
          name: "PATCH /tasks/:id (Toggle Task Status)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                done: true
              })
            },
            url: "{{baseUrl}}/tasks/replace-with-task-id"
          }
        },
        {
          name: "GET /payments (Financials)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/payments"
          }
        },
        {
          name: "POST /payments (Add Transaction Record)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                stage: "Post-Installation Inspection",
                amount: 300000,
                status: "Pending",
                date: "2026-08-20"
              })
            },
            url: "{{baseUrl}}/payments"
          }
        },
        {
          name: "GET /products (Showroom Inventory)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/products"
          }
        },
        {
          name: "POST /products (Create Showroom Item)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Gold Trim Velvet Dining Chair",
                category: "Chair",
                description: "Ergonomic dining chair upholstered in ocean blue velvet with champagne gold legs.",
                price: 18500,
                designs: ["Italian Modern", "Bespoke Gold"],
                materials: ["Stainless Steel Base", "Velvet Fabric"],
                dimensions: "2ft x 2ft x 3.5ft",
                images: ["https://cloudinary.com/velora/chair1.jpg"],
                isAvailable: true
              })
            },
            url: "{{baseUrl}}/products"
          }
        },
        {
          name: "PUT /products/:id (Update Showroom Item)",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                price: 19500,
                isAvailable: false
              })
            },
            url: "{{baseUrl}}/products/replace-with-product-id"
          }
        },
        {
          name: "DELETE /products/:id (Delete Showroom Item)",
          request: {
            method: "DELETE",
            header: [
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            url: "{{baseUrl}}/products/replace-with-product-id"
          }
        },
        {
          name: "GET /documents (Drawings/Contracts)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/documents"
          }
        },
        {
          name: "POST /documents (Register Project Drawing)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Dining Room False Ceiling Layout.pdf",
                size: "2.1 MB",
                url: "https://cloudinary.com/velora/dining-ceiling.pdf"
              })
            },
            url: "{{baseUrl}}/documents"
          }
        },
        {
          name: "GET /notifications",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/notifications"
          }
        },
        {
          name: "POST /notifications (Create Notification)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                recipientId: "replace-with-customer-id",
                recipientType: "Customer",
                type: "update",
                message: "New structural drawing uploaded for your review."
              })
            },
            url: "{{baseUrl}}/notifications"
          }
        },
        {
          name: "GET /meetings (Calendar)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/meetings"
          }
        },
        {
          name: "POST /meetings (Schedule Site Visit)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Site Handover and Verification Visit",
                date: "2026-08-15",
                time: "11:00 AM"
              })
            },
            url: "{{baseUrl}}/meetings"
          }
        },
        {
          name: "GET /invoices (Tax Invoices)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/invoices"
          }
        },
        {
          name: "POST /invoices (Generate Tax Invoice)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                invoiceNumber: "INV-2026-005",
                amount: 300000,
                date: "2026-07-28",
                status: "Unpaid"
              })
            },
            url: "{{baseUrl}}/invoices"
          }
        },
        {
          name: "POST /support (Register Ticket)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                query: "Align wardrobe alignment door in guest bedroom"
              })
            },
            url: "{{baseUrl}}/support"
          }
        },
        {
          name: "PATCH /support/:id/reply (Reply Support Ticket)",
          request: {
            method: "PATCH",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Authorization", value: "Bearer {{adminToken}}" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reply: "The service team has scheduled a technician visit for tomorrow at 10 AM.",
                status: "Resolved"
              })
            },
            url: "{{baseUrl}}/support/replace-with-ticket-id/reply"
          }
        },
        {
          name: "GET /analytics (Operational KPIs)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/analytics"
          }
        }
      ]
    },
    {
      name: "8. Public Website & General Utilities",
      item: [
        {
          name: "POST /projects (Create Project)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Luxurious Villa Pune",
                slug: "luxurious-villa-pune",
                description: "A gorgeous 4BHK villa showcase with premium gold accents.",
                clientReview: "Excellent work done by Velora!",
                clientName: "Rohan",
                budget: "50L+",
                category: "Residential",
                image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                gallery: [
                  "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                ]
              })
            },
            url: "{{baseUrl}}/projects"
          }
        },
        {
          name: "GET /projects (List Projects)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/projects"
          }
        },
        {
          name: "GET /projects/:slug (Get Project by Slug)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/projects/luxurious-villa-pune"
          }
        },
        {
          name: "GET /gallery (List Gallery)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/gallery"
          }
        },
        {
          name: "GET /gallery/:id (Get Gallery Item by ID)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/gallery/some-id"
          }
        },
        {
          name: "GET /guides (List Guides)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/guides"
          }
        },
        {
          name: "GET /guides/:id (Get Guide by ID)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/guides/some-id"
          }
        },
        {
          name: "GET /reviews (List Verified Reviews)",
          request: {
            method: "GET",
            url: "{{baseUrl}}/reviews"
          }
        },
        {
          name: "POST /reviews (Submit Review)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Rahul Verma",
                location: "Kalyani Nagar, Pune",
                rating: 5,
                comment: "Bespoke high-end craftsmanship. Best interior designers in Pune."
              })
            },
            url: "{{baseUrl}}/reviews"
          }
        },
        {
          name: "POST /estimator/calculate (Estimate Cost)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                bhk: 3,
                qualityTier: "Luxury",
                scope: ["Kitchen", "Living Room", "Wardrobes"]
              })
            },
            url: "{{baseUrl}}/estimator/calculate"
          }
        },
        {
          name: "POST /estimator/quote (Submit Quote Request)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Vikas Patil",
                phone: "+91 90000 80000",
                email: "vikas.patil@example.com",
                bhk: 3,
                tier: "Luxury",
                totalEstimatedCost: "18.5L"
              })
            },
            url: "{{baseUrl}}/estimator/quote"
          }
        },
        {
          name: "POST /contact (Submit Contact Form)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Shreya Sen",
                email: "shreya.sen@example.com",
                phone: "+91 99999 44444",
                message: "Interested in office reception lounge renovation."
              })
            },
            url: "{{baseUrl}}/contact"
          }
        },
        {
          name: "GET /contact (List Contact Form Submissions)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/contact"
          }
        },
        {
          name: "POST /consult (Submit Consultation Request)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Rajesh Kulkarni",
                email: "rajesh.k@example.com",
                phone: "+91 98888 55555",
                preferredDate: "2026-08-15",
                preferredTime: "11:00 AM",
                message: "Need 2BHK styling guidance."
              })
            },
            url: "{{baseUrl}}/consult"
          }
        },
        {
          name: "GET /consult (List Consultation Requests)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
            url: "{{baseUrl}}/consult"
          }
        },
        {
          name: "POST /api/upload/image (Upload Image Asset)",
          request: {
            method: "POST",
            body: {
              mode: "formdata",
              formdata: [
                {
                  key: "image",
                  type: "file",
                  src: []
                }
              ]
            },
            url: "http://localhost:3000/api/upload/image"
          }
        },
        {
          name: "POST /api/upload/video (Upload Video Asset)",
          request: {
            method: "POST",
            body: {
              mode: "formdata",
              formdata: [
                {
                  key: "video",
                  type: "file",
                  src: []
                }
              ]
            },
            url: "http://localhost:3000/api/upload/video"
          }
        }
      ]
    }
  ]
};

const filePath = path.join(process.cwd(), "velora_full_backend.postman_collection.json");
fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), "utf8");
console.log(`✅ Postman Collection compiled and saved to: ${filePath}`);
