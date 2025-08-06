
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { AuthContext } from '../App';
import type { Product, CreateProductInput, UpdateProductInput } from '../../../server/src/schema';

export function AdminDashboard() {
  const authContext = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for adding new products
  const [addFormData, setAddFormData] = useState<CreateProductInput>({
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    image_filename: null,
    category: '',
    instagram_handle: null
  });

  // Form state for editing products
  const [editFormData, setEditFormData] = useState<UpdateProductInput>({
    id: 0,
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    image_filename: null,
    category: '',
    instagram_handle: null
  });

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.products.getAll.query();
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newProduct = await trpc.products.add.mutate(addFormData);
      setProducts((prev: Product[]) => [...prev, newProduct]);
      
      // Reset form
      setAddFormData({
        name: '',
        description: null,
        price: 0,
        stock_quantity: 0,
        image_filename: null,
        category: '',
        instagram_handle: null
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedProduct = await trpc.products.edit.mutate(editFormData);
      setProducts((prev: Product[]) =>
        prev.map((p: Product) => p.id === updatedProduct.id ? updatedProduct : p)
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to edit product:', error);
      alert('Failed to edit product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await trpc.products.delete.mutate({ id });
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_filename: product.image_filename,
      category: product.category,
      instagram_handle: product.instagram_handle
    });
    setIsEditDialogOpen(true);
  };

  const handleLogout = () => {
    authContext.logout();
  };

  const handleViewStore = () => {
    authContext.navigate('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard... ⚙️</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              ⚙️ Admin Dashboard
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={handleViewStore}
                variant="outline"
                className="text-gray-600"
              >
                🏪 View Store
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats and Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter((p: Product) => p.stock_quantity > 0).length}
              </div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter((p: Product) => p.stock_quantity === 0).length}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                ➕ Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="add-name">Product Name *</Label>
                  <Input
                    id="add-name"
                    value={addFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="add-category">Category *</Label>
                  <Input
                    id="add-category"
                    value={addFormData.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({ ...prev, category: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="add-description">Description</Label>
                  <Textarea
                    id="add-description"
                    value={addFormData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-price">Price *</Label>
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={addFormData.price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAddFormData((prev: CreateProductInput) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-stock">Stock</Label>
                    <Input
                      id="add-stock"
                      type="number"
                      min="0"
                      value={addFormData.stock_quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAddFormData((prev: CreateProductInput) => ({
                          ...prev,
                          stock_quantity: parseInt(e.target.value) || 0
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="add-image">Image Filename</Label>
                  <Input
                    id="add-image"
                    value={addFormData.image_filename || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        image_filename: e.target.value || null
                      }))
                    }
                    placeholder="e.g., product1.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📝 Upload files to /public/uploads/ folder manually
                  </p>
                </div>

                <div>
                  <Label htmlFor="add-instagram">Instagram Handle</Label>
                  <Input
                    id="add-instagram"
                    value={addFormData.instagram_handle || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        instagram_handle: e.target.value || null
                      }))
                    }
                    placeholder="@username"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? '⏳ Adding...' : '✅ Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600 mb-4">No products yet</p>
            <p className="text-gray-500">Add your first product to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {product.image_filename ? (
                    <img
                      src={`/public/uploads/${product.image_filename}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/api/placeholder/300/300';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      📷
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {product.stock_quantity > 0 ? (
                      <Badge className="bg-green-500">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {product.name}
                    </CardTitle>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
                    <span className="text-gray-600">Stock: {product.stock_quantity}</span>
                  </div>

                  {product.instagram_handle && (
                    <div className="text-xs text-gray-500">
                      📲 {product.instagram_handle}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => openEditDialog(product)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      ✏️ Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          🗑️ Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    ID: {product.id} | Created: {product.created_at.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      description: e.target.value || null
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editFormData.stock_quantity || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({
                        ...prev,
                        stock_quantity: parseInt(e.target.value) || 0
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-image">Image Filename</Label>
                <Input
                  id="edit-image"
                  value={editFormData.image_filename || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      image_filename: e.target.value || null
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-instagram">Instagram Handle</Label>
                <Input
                  id="edit-instagram"
                  value={editFormData.instagram_handle || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      instagram_handle: e.target.value || null
                    }))
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '⏳ Updating...' : '✅ Update Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
