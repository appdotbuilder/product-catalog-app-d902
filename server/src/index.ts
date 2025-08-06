
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';
import { 
  createProductInputSchema, 
  updateProductInputSchema, 
  deleteProductInputSchema,
  adminLoginInputSchema 
} from './schema';
import { getAllProducts } from './handlers/get_all_products';
import { addProduct } from './handlers/add_product';
import { editProduct } from './handlers/edit_product';
import { deleteProduct } from './handlers/delete_product';
import { adminLogin } from './handlers/admin_login';
import { adminLogout } from './handlers/admin_logout';
import { verifyAdminSession } from './handlers/verify_admin_session';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Product router with all CRUD operations
const productRouter = router({
  getAll: publicProcedure
    .query(() => getAllProducts()),
  add: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => addProduct(input)),
  edit: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => editProduct(input)),
  delete: publicProcedure
    .input(deleteProductInputSchema)
    .mutation(({ input }) => deleteProduct(input)),
});

// Admin router for authentication
const adminRouter = router({
  login: publicProcedure
    .input(adminLoginInputSchema)
    .mutation(({ input }) => adminLogin(input)),
  logout: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(({ input }) => adminLogout(input.sessionToken)),
  verifySession: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(({ input }) => verifyAdminSession(input.sessionToken)),
});

// Main app router
const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  products: productRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
