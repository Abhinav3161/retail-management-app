import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl gradient-primary items-center justify-center mb-4">
            <span className="text-xl font-bold text-primary-foreground">R</span>
          </div>
          <h1 className="text-2xl font-bold">RetailPro</h1>
          <p className="text-muted-foreground mt-1">Enterprise Billing & Analytics</p>
        </div>
        <Outlet />
      </motion.div>
    </div>
  );
}
