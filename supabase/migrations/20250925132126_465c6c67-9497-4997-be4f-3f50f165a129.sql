-- Create main inventory management tables

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  max_stock INTEGER,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  barcode TEXT,
  location TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock movements table for tracking all inventory changes
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT, -- order number, transfer reference, etc.
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Locations/warehouses table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product locations table for multi-location inventory
CREATE TABLE public.product_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  UNIQUE(product_id, location_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Users can view their own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for stock movements
CREATE POLICY "Users can view their own stock movements" ON public.stock_movements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for suppliers
CREATE POLICY "Users can view their own suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for purchase orders
CREATE POLICY "Users can view their own purchase orders" ON public.purchase_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchase orders" ON public.purchase_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchase orders" ON public.purchase_orders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchase orders" ON public.purchase_orders
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for purchase order items
CREATE POLICY "Users can view their own purchase order items" ON public.purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create their own purchase order items" ON public.purchase_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their own purchase order items" ON public.purchase_order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their own purchase order items" ON public.purchase_order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for locations
CREATE POLICY "Users can view their own locations" ON public.locations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own locations" ON public.locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own locations" ON public.locations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own locations" ON public.locations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product locations
CREATE POLICY "Users can view their own product locations" ON public.product_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create their own product locations" ON public.product_locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their own product locations" ON public.product_locations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their own product locations" ON public.product_locations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_quantity ON public.products(quantity);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_user_id ON public.stock_movements(user_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX idx_locations_user_id ON public.locations(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Create a default location
  INSERT INTO public.locations (name, user_id, is_default)
  VALUES ('Entrepôt Principal', NEW.id, true);
  
  -- Create default categories
  INSERT INTO public.categories (name, color, user_id) VALUES
  ('Électronique', '#3B82F6', NEW.id),
  ('Mobilier', '#10B981', NEW.id),
  ('Vêtements', '#F59E0B', NEW.id),
  ('Alimentation', '#EF4444', NEW.id),
  ('Autres', '#6B7280', NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update product quantities after stock movements
CREATE OR REPLACE FUNCTION public.update_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update main product quantity
  UPDATE public.products 
  SET quantity = NEW.new_quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update product quantity after stock movement
CREATE TRIGGER on_stock_movement_created
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_product_quantity();

-- Function to generate unique SKU
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_sku TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_sku := 'SKU-' || LPAD(counter::TEXT, 6, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE sku = new_sku) THEN
      RETURN new_sku;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$;