import { MockDataService } from '../services/mockDataService';
import { ProfitLossReport, CategoryExpense, TaxSummary } from '../shared/types';
import { isInvoicePaid } from './invoiceUtils';

export class ReportGenerator {
  async generateProfitLoss(startDate: string, endDate: string): Promise<ProfitLossReport> {
    // Get all invoices in date range
    const allInvoices = await MockDataService.getInvoices();
    const invoices = allInvoices.filter(
      (inv) => inv.date >= startDate && inv.date <= endDate && isInvoicePaid(inv)
    );

    const totalIncome = invoices.reduce((sum, inv) => sum + inv.total, 0);

    // Get all business expenses in date range
    const transactions = await MockDataService.getTransactions({
      startDate,
      endDate,
      isBusiness: true,
    });

    // Group by category
    const categoryMap = new Map<number, CategoryExpense>();
    
    for (const trans of transactions) {
      const catId = trans.category_id || 0;
      const catName = (trans as any).category_name || 'Uncategorized';
      const catColor = (trans as any).category_color;

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          category_id: catId,
          category_name: catName,
          category_color: catColor,
          total: 0,
          transaction_count: 0,
        });
      }

      const cat = categoryMap.get(catId)!;
      cat.total += trans.amount;
      cat.transaction_count++;
    }

    const by_category = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
    const totalExpenses = by_category.reduce((sum, cat) => sum + cat.total, 0);

    return {
      period: `${startDate} to ${endDate}`,
      income: {
        total: totalIncome,
        by_category: [], // Income doesn't have categories, only invoices
        invoices,
      },
      expenses: {
        total: totalExpenses,
        by_category,
      },
      net_profit: totalIncome - totalExpenses,
    };
  }

  async generateExpenseByCategory(startDate: string, endDate: string): Promise<CategoryExpense[]> {
    const transactions = await MockDataService.getTransactions({
      startDate,
      endDate,
      isBusiness: true,
    });

    const categoryMap = new Map<number, CategoryExpense>();
    
    for (const trans of transactions) {
      const catId = trans.category_id || 0;
      const catName = (trans as any).category_name || 'Uncategorized';
      const catColor = (trans as any).category_color;

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          category_id: catId,
          category_name: catName,
          category_color: catColor,
          total: 0,
          transaction_count: 0,
        });
      }

      const cat = categoryMap.get(catId)!;
      cat.total += trans.amount;
      cat.transaction_count++;
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }

  async generateTaxSummary(year: number): Promise<TaxSummary> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Get income
    const allInvoices = await MockDataService.getInvoices();
    const invoices = allInvoices.filter(
      (inv) => inv.date >= startDate && inv.date <= endDate && isInvoicePaid(inv)
    );
    const totalIncome = invoices.reduce((sum, inv) => sum + inv.total, 0);

    // Get expenses by IRS category
    const transactions = await MockDataService.getTransactions({
      startDate,
      endDate,
      isBusiness: true,
    });

    const categories = await MockDataService.getCategories();
    const irsCategoryMap = new Map<string, number>();

    for (const trans of transactions) {
      const category = categories.find((c) => c.id === trans.category_id);
      const irsCategory = category?.irs_category || 'Other Expenses';

      irsCategoryMap.set(irsCategory, (irsCategoryMap.get(irsCategory) || 0) + trans.amount);
    }

    const totalExpenses = Array.from(irsCategoryMap.values()).reduce((sum, val) => sum + val, 0);

    // Get mileage deduction
    const mileageEntries = await MockDataService.getMileageEntries({
      startDate,
      endDate,
    });
    // Filter for business mileage
    const businessMileageEntries = mileageEntries.filter(entry => entry.is_business === 1);

    const totalBusinessMiles = businessMileageEntries.reduce((sum, entry) => sum + entry.miles, 0);
    const settings = await MockDataService.getSettings();
    const mileageRate = settings.irs_mileage_rate || 0.67;
    const mileageDeduction = totalBusinessMiles * mileageRate;

    return {
      tax_year: year.toString(),
      year,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      expense_by_irs_category: Object.fromEntries(irsCategoryMap),
      mileage_deduction: mileageDeduction,
      total_business_miles: totalBusinessMiles,
      net_profit: totalIncome - totalExpenses - mileageDeduction,
    };
  }
}












