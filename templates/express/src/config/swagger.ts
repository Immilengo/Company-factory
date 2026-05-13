import swaggerJsdoc from 'swagger-jsdoc';

const bearerSecurity = [{ bearerAuth: [] }];

const json = (schema: Record<string, unknown>) => ({
  content: {
    'application/json': {
      schema
    }
  }
});

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mayongi Enterprise Backend API',
      version: '1.0.0',
      description: 'Enterprise-ready modular monolith backend template'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['success', 'message', 'errors'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation error' },
            errors: {
              type: 'array',
              items: { type: 'object', additionalProperties: true },
              example: []
            }
          }
        },

        AuthUser: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            status: { type: 'string', nullable: true, example: 'ACTIVE' },
            emailVerified: { type: 'boolean' },
            roles: { type: 'array', items: { type: 'string' }, example: ['USER'] }
          }
        },

        TokenPair: {
          type: 'object',
          required: ['accessToken', 'refreshToken'],
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },

        ImageAsset: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ownerType: { type: 'string', enum: ['USER', 'PRODUCT', 'GENERIC'] },
            ownerId: { type: 'string', format: 'uuid' },
            url: { type: 'string' },
            fileName: { type: 'string' },
            contentType: { type: 'string' },
            sizeBytes: { type: 'string', example: '1024' },
            primaryImage: { type: 'boolean' },
            sortOrder: { type: 'integer' },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            status: { type: 'string', nullable: true },
            emailVerified: { type: 'boolean' },
            roles: { type: 'array', items: { type: 'string' } },
            profileImage: {
              oneOf: [{ $ref: '#/components/schemas/ImageAsset' }, { type: 'null' }]
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        RoleResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        StatusResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            deleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        TicketResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            subject: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['PENDENTE', 'PROCESSANDO', 'RESOLVIDO', 'FECHADO'] },
            requesterId: { type: 'string', format: 'uuid' },
            requesterEmail: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        UserPage: {
          type: 'object',
          properties: {
            content: { type: 'array', items: { $ref: '#/components/schemas/UserResponse' } },
            pageable: {
              type: 'object',
              properties: {
                pageNumber: { type: 'integer' },
                pageSize: { type: 'integer' }
              }
            },
            totalElements: { type: 'integer' },
            totalPages: { type: 'integer' },
            first: { type: 'boolean' },
            last: { type: 'boolean' },
            number: { type: 'integer' },
            size: { type: 'integer' },
            numberOfElements: { type: 'integer' },
            empty: { type: 'boolean' }
          }
        },

        TicketPage: {
          type: 'object',
          properties: {
            content: { type: 'array', items: { $ref: '#/components/schemas/TicketResponse' } },
            pageable: {
              type: 'object',
              properties: {
                pageNumber: { type: 'integer' },
                pageSize: { type: 'integer' }
              }
            },
            totalElements: { type: 'integer' },
            totalPages: { type: 'integer' },
            first: { type: 'boolean' },
            last: { type: 'boolean' },
            number: { type: 'integer' },
            size: { type: 'integer' },
            numberOfElements: { type: 'integer' },
            empty: { type: 'boolean' }
          }
        }
      }
    },
    tags: [{ name: 'System' }, { name: 'Auth' }, { name: 'Users' }, { name: 'Roles' }, { name: 'Statuses' }, { name: 'Tickets' }, { name: 'Images' }],

    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            '200': json({
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object', properties: { uptime: { type: 'number' } } }
              }
            })
          }
        }
      },

      '/actuator/health': {
        get: {
          tags: ['System'],
          summary: 'Actuator health',
          responses: { '200': json({ type: 'object', properties: { status: { type: 'string', example: 'UP' } } }) }
        }
      },

      '/public/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar conta',
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['fullName', 'email', 'password'],
              properties: {
                fullName: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@company.com' },
                password: { type: 'string', minLength: 8, example: 'StrongPass123@' },
                phone: { type: 'string', example: '+244900000000' }
              }
            })
          },
          responses: {
            '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }),
            '400': json({ $ref: '#/components/schemas/ErrorResponse' })
          }
        }
      },

      '/public/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 }
              }
            })
          },
          responses: {
            '200': json({
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { $ref: '#/components/schemas/TokenPair' }
              }
            })
          }
        }
      },

      '/public/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/public/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh token',
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TokenPair' } } }) }
        }
      },

      '/public/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Esqueci senha',
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/public/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Resetar senha',
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['token', 'newPassword'],
              properties: {
                token: { type: 'string' },
                newPassword: { type: 'string', minLength: 8 }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/public/auth/verify-email': {
        get: {
          tags: ['Auth'],
          summary: 'Verificar email',
          parameters: [{ name: 'token', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/public/auth/resend-verification-email': {
        post: {
          tags: ['Auth'],
          summary: 'Reenviar verificacao',
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/users': {
        post: {
          tags: ['Users'],
          summary: 'Criar usuario',
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['fullName', 'email', 'password'],
              properties: {
                fullName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                phone: { type: 'string' },
                statusId: { type: 'string', format: 'uuid' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } }) }
        },
        get: {
          tags: ['Users'],
          summary: 'Listar usuarios',
          security: bearerSecurity,
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
            { name: 'size', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['fullName', 'email', 'createdAt', 'updatedAt'], default: 'createdAt' } },
            { name: 'direction', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
            { name: 'statusId', in: 'query', schema: { type: 'string', format: 'uuid' } },
            { name: 'recordStatus', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' } }
          ],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserPage' } } }) }
        }
      },

      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Perfil atual',
          security: bearerSecurity,
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } }) }
        }
      },

      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Detalhar usuario',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } }) }
        },
        patch: {
          tags: ['Users'],
          summary: 'Atualizar usuario parcialmente',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              properties: {
                fullName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                statusId: { type: 'string', format: 'uuid' },
                active: { type: 'boolean' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } }) }
        },
        delete: {
          tags: ['Users'],
          summary: 'Desativar usuario',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/users/{id}/roles': {
        patch: {
          tags: ['Users'],
          summary: 'Adicionar role ao usuario',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['roleName'], properties: { roleName: { type: 'string', example: 'MANAGER' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/UserResponse' } } }) }
        }
      },

      '/api/users/{id}/profile-image': {
        post: {
          tags: ['Users'],
          summary: 'Atualizar foto de perfil',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['url'],
              properties: {
                url: { type: 'string', format: 'uri' },
                fileName: { type: 'string' },
                contentType: { type: 'string' },
                sizeBytes: { type: 'integer' },
                sortOrder: { type: 'integer' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/ImageAsset' } } }) }
        },
        get: {
          tags: ['Users'],
          summary: 'Obter foto de perfil',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': json({
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { oneOf: [{ $ref: '#/components/schemas/ImageAsset' }, { type: 'null' }] }
              }
            })
          }
        }
      },

      '/api/roles': {
        post: {
          tags: ['Roles'],
          summary: 'Criar role',
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/RoleResponse' } } }) }
        },
        get: {
          tags: ['Roles'],
          summary: 'Listar roles',
          security: bearerSecurity,
          parameters: [{ name: 'recordStatus', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/RoleResponse' } } } }) }
        }
      },

      '/api/roles/{id}': {
        get: {
          tags: ['Roles'],
          summary: 'Detalhar role',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/RoleResponse' } } }) }
        },
        put: {
          tags: ['Roles'],
          summary: 'Atualizar role',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/RoleResponse' } } }) }
        },
        patch: {
          tags: ['Roles'],
          summary: 'Patch role',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({ type: 'object', properties: { name: { type: 'string' }, description: { type: 'string', nullable: true }, active: { type: 'boolean' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/RoleResponse' } } }) }
        },
        delete: {
          tags: ['Roles'],
          summary: 'Desativar role',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/statuses': {
        post: {
          tags: ['Statuses'],
          summary: 'Criar status',
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['code', 'name'],
              properties: {
                code: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/StatusResponse' } } }) }
        },
        get: {
          tags: ['Statuses'],
          summary: 'Listar status',
          security: bearerSecurity,
          parameters: [{ name: 'recordStatus', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/StatusResponse' } } } }) }
        }
      },

      '/api/statuses/{id}': {
        get: {
          tags: ['Statuses'],
          summary: 'Detalhar status',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/StatusResponse' } } }) }
        },
        put: {
          tags: ['Statuses'],
          summary: 'Atualizar status',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['code', 'name'],
              properties: {
                code: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/StatusResponse' } } }) }
        },
        patch: {
          tags: ['Statuses'],
          summary: 'Patch status',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({ type: 'object', properties: { code: { type: 'string' }, name: { type: 'string' }, description: { type: 'string', nullable: true }, active: { type: 'boolean' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/StatusResponse' } } }) }
        },
        delete: {
          tags: ['Statuses'],
          summary: 'Desativar status',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/tickets': {
        post: {
          tags: ['Tickets'],
          summary: 'Criar ticket',
          security: bearerSecurity,
          requestBody: {
            required: true,
            ...json({ type: 'object', required: ['subject', 'description'], properties: { subject: { type: 'string' }, description: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TicketResponse' } } }) }
        },
        get: {
          tags: ['Tickets'],
          summary: 'Listar tickets',
          security: bearerSecurity,
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
            { name: 'size', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['subject', 'status', 'createdAt', 'updatedAt'], default: 'createdAt' } },
            { name: 'direction', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDENTE', 'PROCESSANDO', 'RESOLVIDO', 'FECHADO'] } },
            { name: 'recordStatus', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' } }
          ],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TicketPage' } } }) }
        }
      },

      '/api/tickets/{id}': {
        get: {
          tags: ['Tickets'],
          summary: 'Detalhar ticket',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TicketResponse' } } }) }
        },
        patch: {
          tags: ['Tickets'],
          summary: 'Patch ticket',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({ type: 'object', properties: { subject: { type: 'string' }, description: { type: 'string' } } })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TicketResponse' } } }) }
        },
        delete: {
          tags: ['Tickets'],
          summary: 'Desativar ticket',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/tickets/{id}/status': {
        patch: {
          tags: ['Tickets'],
          summary: 'Atualizar status do ticket',
          security: bearerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['status'],
              properties: { status: { type: 'string', enum: ['PENDENTE', 'PROCESSANDO', 'RESOLVIDO', 'FECHADO'] } }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/TicketResponse' } } }) }
        }
      },

      '/api/images/{ownerType}/{ownerId}': {
        post: {
          tags: ['Images'],
          summary: 'Criar imagem para entidade',
          security: bearerSecurity,
          parameters: [
            { name: 'ownerType', in: 'path', required: true, schema: { type: 'string', enum: ['USER', 'PRODUCT', 'GENERIC'] } },
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            ...json({
              type: 'object',
              required: ['url', 'fileName', 'contentType', 'sizeBytes'],
              properties: {
                url: { type: 'string', format: 'uri' },
                fileName: { type: 'string' },
                contentType: { type: 'string' },
                sizeBytes: { type: 'integer' },
                primaryImage: { type: 'boolean' },
                sortOrder: { type: 'integer' }
              }
            })
          },
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/ImageAsset' } } }) }
        },
        get: {
          tags: ['Images'],
          summary: 'Listar imagens por entidade',
          security: bearerSecurity,
          parameters: [
            { name: 'ownerType', in: 'path', required: true, schema: { type: 'string', enum: ['USER', 'PRODUCT', 'GENERIC'] } },
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'recordStatus', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' } }
          ],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/ImageAsset' } } } }) }
        }
      },

      '/api/images/{ownerType}/{ownerId}/{imageId}/primary': {
        patch: {
          tags: ['Images'],
          summary: 'Definir imagem principal',
          security: bearerSecurity,
          parameters: [
            { name: 'ownerType', in: 'path', required: true, schema: { type: 'string', enum: ['USER', 'PRODUCT', 'GENERIC'] } },
            { name: 'ownerId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      },

      '/api/images/{imageId}/status': {
        patch: {
          tags: ['Images'],
          summary: 'Atualizar status da imagem',
          security: bearerSecurity,
          parameters: [
            { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'active', in: 'query', required: true, schema: { type: 'boolean' } }
          ],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/ImageAsset' } } }) }
        }
      },

      '/api/images/{imageId}': {
        delete: {
          tags: ['Images'],
          summary: 'Remover imagem',
          security: bearerSecurity,
          parameters: [{ name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': json({ type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'null' } } }) }
        }
      }
    }
  },
  apis: []
});
