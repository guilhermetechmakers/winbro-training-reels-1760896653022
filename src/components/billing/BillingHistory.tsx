/**
 * Billing History Component
 * Generated: 2024-12-21T13:00:00Z
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Eye, FileText, CreditCard, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvoices, usePayments, useGenerateInvoicePdf } from '@/hooks/useBilling';
import { cn } from '@/lib/utils';

interface BillingHistoryProps {
  organizationId: string;
  className?: string;
}

export function BillingHistory({ organizationId, className }: BillingHistoryProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading: invoicesLoading } = useInvoices(organizationId, {
    query: searchQuery,
    filters: { status: statusFilter === 'all' ? undefined : statusFilter },
  });

  const { data: payments, isLoading: paymentsLoading } = usePayments(organizationId, {
    query: searchQuery,
    filters: { status: statusFilter === 'all' ? undefined : statusFilter },
  });

  const generatePdf = useGenerateInvoicePdf();

  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    const symbol = currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-500', text: 'Paid' },
      open: { color: 'bg-yellow-500', text: 'Open' },
      draft: { color: 'bg-gray-500', text: 'Draft' },
      void: { color: 'bg-red-500', text: 'Void' },
      uncollectible: { color: 'bg-red-600', text: 'Uncollectible' },
      succeeded: { color: 'bg-green-500', text: 'Succeeded' },
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      failed: { color: 'bg-red-500', text: 'Failed' },
      cancelled: { color: 'bg-gray-500', text: 'Cancelled' },
      refunded: { color: 'bg-orange-500', text: 'Refunded' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status };
    
    return (
      <Badge className={cn('text-white', config.color)}>
        {config.text}
      </Badge>
    );
  };

  const handleGeneratePdf = async (invoiceId: string) => {
    try {
      await generatePdf.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const isLoading = invoicesLoading || paymentsLoading;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Billing History</h1>
        <p className="text-gray-600">
          View and manage your invoices and payment history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'invoices'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={cn(
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'payments'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Payments
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {activeTab === 'invoices' ? (
              <>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : activeTab === 'invoices' ? (
        <div className="space-y-4">
          {invoices?.data.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">📄</div>
                  <h3 className="text-xl font-semibold">No Invoices Found</h3>
                  <p className="text-gray-600">
                    Invoices will appear here once you have an active subscription
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices?.data.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(invoice.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {formatCurrency(invoice.total_cents, invoice.currency)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Due: {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(invoice.status)}
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {}}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Invoice Details</DialogTitle>
                                  <DialogDescription>
                                    Invoice {invoice.invoice_number}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Amount</label>
                                      <div className="text-lg font-semibold">
                                        {formatCurrency(invoice.total_cents, invoice.currency)}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Status</label>
                                      <div>{getStatusBadge(invoice.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Created</label>
                                      <div>{formatDate(invoice.created_at)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Due Date</label>
                                      <div>{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</div>
                                    </div>
                                  </div>
                                  {invoice.line_items && invoice.line_items.length > 0 && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Line Items</label>
                                      <div className="mt-2 space-y-2">
                                        {invoice.line_items.map((item, index) => (
                                          <div key={index} className="flex justify-between text-sm">
                                            <span>{item.description}</span>
                                            <span>{formatCurrency(item.total_cents, invoice.currency)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePdf(invoice.id)}
                              disabled={generatePdf.isPending}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {payments?.data.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">💳</div>
                  <h3 className="text-xl font-semibold">No Payments Found</h3>
                  <p className="text-gray-600">
                    Payment history will appear here once you make payments
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments?.data.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Payment #{payment.id.slice(-8)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(payment.created_at)}
                              </p>
                              {payment.payment_method_type && (
                                <p className="text-sm text-gray-500">
                                  {payment.payment_method_type} •••• {payment.payment_method_last4}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {formatCurrency(payment.amount_cents, payment.currency)}
                              </div>
                              {payment.refunded_amount_cents > 0 && (
                                <div className="text-sm text-red-600">
                                  Refunded: {formatCurrency(payment.refunded_amount_cents, payment.currency)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {(invoices?.pagination.totalPages || 0) > 1 && (
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
