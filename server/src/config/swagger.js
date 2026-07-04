const spec = {
  openapi: '3.0.0',
  info: {
    title: 'CS hub (iCT) API',
    version: '1.0.0',
    description: 'REST API for the Computer Support platform — manage users, tickets, suggestions, contacts, and team applications.',
    contact: { email: 'support@cshub.rw' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Development' },
    { url: 'https://computer-support-ict.onrender.com', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
          isAdmin: { type: 'boolean' }, createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string' }, userId: { type: 'string' }, userName: { type: 'string' },
          title: { type: 'string' }, description: { type: 'string' },
          category: { type: 'string', enum: ['general', 'hardware', 'software', 'virus', 'network', 'training'] },
          status: { type: 'string', enum: ['open', 'in-progress', 'resolved', 'closed'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Suggestion: {
        type: 'object',
        properties: {
          id: { type: 'string' }, userId: { type: 'string' }, userName: { type: 'string' },
          title: { type: 'string' }, description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'reviewed', 'implemented'] },
          adminResponse: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
          message: { type: 'string' }, status: { type: 'string', enum: ['new', 'read', 'responded'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TeamApp: {
        type: 'object',
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
          phone: { type: 'string' }, education: { type: 'string' }, location: { type: 'string' },
          involvement: { type: 'string' }, skills: { type: 'array', items: { type: 'string' } },
          message: { type: 'string' }, status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  paths: {
    // ── Auth ──
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Create a new account',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }, required: ['name', 'email', 'password'] } } } },
        responses: { 201: { description: 'User registered', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } }, 409: { description: 'Email already registered' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Sign in',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { 200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user', security: [{ BearerAuth: [] }], responses: { 200: { description: 'User data' } } },
    },
    '/api/auth/profile': {
      put: { tags: ['Auth'], summary: 'Update profile', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' } }, required: ['name', 'email'] } } } }, responses: { 200: { description: 'Profile updated' } } },
    },
    '/api/auth/password': {
      put: { tags: ['Auth'], summary: 'Change password', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['currentPassword', 'newPassword'] } } } }, responses: { 200: { description: 'Password changed' } } },
    },
    '/api/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Request password reset code', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } } } }, responses: { 200: { description: 'Reset token returned' } } },
    },
    '/api/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password with token', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['email', 'token', 'newPassword'] } } } }, responses: { 200: { description: 'Password reset' } } },
    },
    // ── Tickets ──
    '/api/tickets': {
      post: { tags: ['Tickets'], summary: 'Create a ticket', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' } }, required: ['title', 'description'] } } } }, responses: { 201: { description: 'Ticket created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } } } } },
      get: { tags: ['Tickets'], summary: 'Get my tickets', security: [{ BearerAuth: [] }], responses: { 200: { description: 'List of user tickets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } } } } } } },
    },
    '/api/tickets/{id}': {
      get: { tags: ['Tickets'], summary: 'Get a ticket', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket data' } } },
      put: { tags: ['Tickets'], summary: 'Update a ticket', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket updated' } } },
      delete: { tags: ['Tickets'], summary: 'Delete a ticket', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket deleted' } } },
    },
    // ── Contact ──
    '/api/contact': {
      post: { tags: ['Contact'], summary: 'Submit contact form (public)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, message: { type: 'string' } }, required: ['name', 'email', 'message'] } } } }, responses: { 201: { description: 'Message sent' } } },
    },
    // ── Suggestions ──
    '/api/suggestions': {
      post: { tags: ['Suggestions'], summary: 'Submit a suggestion', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'description'] } } } }, responses: { 201: { description: 'Suggestion submitted' } } },
      get: { tags: ['Suggestions'], summary: 'Get my suggestions', security: [{ BearerAuth: [] }], responses: { 200: { description: 'List of suggestions' } } },
    },
    // ── Team Apply ──
    '/api/team/apply': {
      post: { tags: ['Team Applications'], summary: 'Apply to join the team (public)', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, education: { type: 'string' }, location: { type: 'string' }, involvement: { type: 'string' }, skills: { type: 'array', items: { type: 'string' } }, message: { type: 'string' } }, required: ['name', 'email', 'education', 'location', 'message'] } } } }, responses: { 201: { description: 'Application submitted' } } },
    },
    // ── Admin — Users ──
    '/api/admin/users': {
      get: { tags: ['Admin — Users'], summary: 'List all users', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Array of users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } },
      post: { tags: ['Admin — Users'], summary: 'Create a user', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, isAdmin: { type: 'boolean' } }, required: ['name', 'email', 'password'] } } } }, responses: { 201: { description: 'User created' } } },
    },
    '/api/admin/users/{id}': {
      put: { tags: ['Admin — Users'], summary: 'Update a user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, isAdmin: { type: 'boolean' } } } } } }, responses: { 200: { description: 'User updated' } } },
      delete: { tags: ['Admin — Users'], summary: 'Delete a user', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'User deleted' } } },
    },
    // ── Admin — Tickets ──
    '/api/admin/tickets': {
      get: { tags: ['Admin — Tickets'], summary: 'List all tickets', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Array of tickets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } } } } } } },
      post: { tags: ['Admin — Tickets'], summary: 'Create a ticket for any user', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' }, status: { type: 'string' } }, required: ['title', 'description'] } } } }, responses: { 201: { description: 'Ticket created' } } },
    },
    '/api/admin/tickets/{id}': {
      put: { tags: ['Admin — Tickets'], summary: 'Update any ticket', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket updated' } } },
      delete: { tags: ['Admin — Tickets'], summary: 'Delete any ticket', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket deleted' } } },
    },
    // ── Admin — Suggestions ──
    '/api/admin/suggestions': {
      get: { tags: ['Admin — Suggestions'], summary: 'List all suggestions', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Array of suggestions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Suggestion' } } } } } } },
    },
    '/api/admin/suggestions/{id}': {
      put: { tags: ['Admin — Suggestions'], summary: 'Update suggestion (status, response)', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Suggestion updated' } } },
      delete: { tags: ['Admin — Suggestions'], summary: 'Delete a suggestion', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Suggestion deleted' } } },
    },
    // ── Admin — Contacts ──
    '/api/admin/contacts': {
      get: { tags: ['Admin — Contacts'], summary: 'List all contact messages', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Array of contacts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Contact' } } } } } } },
    },
    '/api/admin/contacts/{id}': {
      put: { tags: ['Admin — Contacts'], summary: 'Update contact status', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Contact updated' } } },
      delete: { tags: ['Admin — Contacts'], summary: 'Delete a contact message', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Contact deleted' } } },
    },
    // ── Admin — Team Apps ──
    '/api/admin/team-apps': {
      get: { tags: ['Admin — Applications'], summary: 'List all team applications', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Array of applications', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TeamApp' } } } } } } },
    },
    '/api/admin/team-apps/{id}': {
      put: { tags: ['Admin — Applications'], summary: 'Update application status', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Application updated' } } },
      delete: { tags: ['Admin — Applications'], summary: 'Delete an application', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Application deleted' } } },
    },
  },
};

export default spec;
