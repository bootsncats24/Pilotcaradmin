/**
 * Intelligent Auto-Categorization System
 * Automatically categorizes transactions based on vendor names, descriptions, and patterns
 */

export interface CategoryMatch {
  categoryName: string;
  confidence: number;
  matchedKeyword?: string;
}

export class AutoCategorizor {
  /**
   * Built-in categorization rules with smart pattern matching
   */
  private static readonly BUILT_IN_RULES: Record<string, string[]> = {
    'Fuel': [
      // Major gas station chains
      'chevron', 'shell', 'bp', 'exxon', 'mobil', 'texaco', 'arco',
      'valero', 'marathon', 'phillips 66', 'conoco', 'sunoco', 'citgo',
      '76', 'speedway', 'wawa', 'sheetz', 'pilot', 'flying j', 'loves',
      'circle k', 'casey\'s', 'kwik trip', 'maverik', 'bucee',
      // Generic terms
      'gas station', 'fuel', 'petrol', 'diesel', 'gasoline', 'pump'
    ],
    'Meals': [
      // Fast food
      'mcdonald', 'burger king', 'wendy', 'taco bell', 'kfc', 'popeyes',
      'chick-fil-a', 'chipotle', 'subway', 'panera', 'arby', 'sonic',
      'jack in the box', 'carl\'s jr', 'hardee', 'whataburger', 'in-n-out',
      // Coffee
      'starbucks', 'dunkin', 'coffee', 'cafe', 'espresso', 'latte',
      // Restaurants
      'restaurant', 'diner', 'grill', 'bistro', 'pizz', 'bar & grill',
      'tavern', 'pub', 'eatery', 'kitchen', 'food', 'dining'
    ],
    'Maintenance': [
      'auto repair', 'mechanic', 'auto service', 'oil change', 'tire',
      'brake', 'muffler', 'transmission', 'alignment', 'smog', 'inspection',
      'jiffy lube', 'valvoline', 'midas', 'goodyear', 'firestone',
      'pep boys', 'autozone', 'napa', 'o\'reilly', 'advance auto',
      'car wash', 'detailing', 'body shop', 'collision'
    ],
    'Office': [
      'staples', 'office depot', 'officemax', 'paper', 'printer',
      'office supply', 'fedex', 'ups store', 'kinko', 'postage',
      'shipping', 'envelope', 'ink', 'toner', 'filing'
    ],
    'Materials': [
      'home depot', 'lowe\'s', 'menards', 'ace hardware', 'true value',
      'hardware', 'lumber', 'plywood', 'construction', 'building supply',
      'tool', 'equipment rental', 'supplies'
    ],
    'Insurance': [
      'geico', 'state farm', 'progressive', 'allstate', 'liberty mutual',
      'farmers insurance', 'nationwide', 'usaa', 'travelers', 'metlife',
      'insurance premium', 'auto insurance', 'vehicle insurance', 'liability'
    ],
    'Tolls': [
      'toll', 'turnpike', 'ezpass', 'e-zpass', 'fastrak', 'ipass',
      'sunpass', 'pike pass', 'bridge toll', 'tunnel toll', 'express lane'
    ],
    'Equipment': [
      'computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'tablet',
      'phone', 'camera', 'scanner', 'software', 'hardware', 'electronics',
      'best buy', 'apple store', 'microsoft store', 'amazon'
    ],
    'Parking': [
      'parking', 'park & pay', 'garage', 'lot', 'meter', 'valet'
    ],
    'Lodging': [
      'hotel', 'motel', 'inn', 'lodge', 'resort', 'marriott', 'hilton',
      'holiday inn', 'comfort inn', 'quality inn', 'best western',
      'hyatt', 'sheraton', 'airbnb', 'vrbo', 'accommodation'
    ],
    'Phone': [
      'verizon', 'at&t', 'att', 't-mobile', 'sprint', 'cricket', 'metro pcs',
      'boost mobile', 'straight talk', 'mobile', 'wireless', 'cell phone',
      'telephone', 'telecom'
    ],
    'Internet': [
      'comcast', 'xfinity', 'spectrum', 'cox', 'centurylink', 'frontier',
      'verizon fios', 'internet', 'broadband', 'wifi', 'cable'
    ],
    'Utilities': [
      'electric', 'gas & electric', 'power', 'water', 'sewer', 'utility',
      'pg&e', 'duke energy', 'con edison', 'commonwealth edison'
    ],
    'Bank Fees': [
      'bank fee', 'bank fees', 'banking fee', 'banking fees',
      'service charge', 'service fee', 'monthly fee', 'monthly service fee',
      'maintenance fee', 'account fee', 'account maintenance fee',
      'atm fee', 'atm surcharge', 'atm transaction fee',
      'overdraft', 'overdraft fee', 'overdraft charge', 'nsf',
      'non-sufficient funds', 'returned check', 'returned check fee',
      'wire transfer fee', 'wire fee', 'transfer fee',
      'transaction fee', 'processing fee', 'convenience fee',
      'bank charge', 'bank charges', 'banking charge',
      'account maintenance', 'minimum balance fee', 'low balance fee',
      'chase fee', 'bank of america fee', 'wells fargo fee',
      'us bank fee', 'citibank fee', 'fees', 'fee charge',
      'bank service', 'financial service fee', 'bank service charge',
      'monthly maintenance', 'account service', 'checking fee',
      'savings fee', 'debit card fee', 'card fee'
    ]
  };

  /**
   * Automatically categorize a transaction
   */
  static categorize(
    description: string,
    vendor?: string,
    _amount?: number,
    customRules?: Array<{ category: string; keywords: string[] }>
  ): CategoryMatch | null {
    const searchText = `${description} ${vendor || ''}`.toLowerCase().trim();
    
    if (!searchText) {
      return null;
    }

    let bestMatch: CategoryMatch | null = null;
    let highestConfidence = 0;

    // Check custom rules first (higher priority)
    if (customRules && customRules.length > 0) {
      for (const rule of customRules) {
        for (const keyword of rule.keywords) {
          const keywordLower = keyword.toLowerCase().trim();
          if (keywordLower && searchText.includes(keywordLower)) {
            const confidence = this.calculateConfidence(searchText, keywordLower, true);
            if (confidence > highestConfidence) {
              highestConfidence = confidence;
              bestMatch = {
                categoryName: rule.category,
                confidence,
                matchedKeyword: keyword
              };
            }
          }
        }
      }
    }

    // Check built-in rules
    for (const [categoryName, keywords] of Object.entries(this.BUILT_IN_RULES)) {
      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase().trim();
        if (keywordLower && searchText.includes(keywordLower)) {
          const confidence = this.calculateConfidence(searchText, keywordLower, false);
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              categoryName,
              confidence,
              matchedKeyword: keyword
            };
          }
        }
      }
    }

    // Only return matches with reasonable confidence
    if (bestMatch && bestMatch.confidence >= 0.5) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Calculate confidence score for a match
   */
  private static calculateConfidence(
    searchText: string,
    keyword: string,
    isCustomRule: boolean
  ): number {
    let confidence = 0.6; // Base confidence

    // Custom rules get higher base confidence
    if (isCustomRule) {
      confidence = 0.8;
    }

    // Exact word match (not just substring)
    const words = searchText.split(/\s+/);
    if (words.includes(keyword)) {
      confidence += 0.2;
    }

    // Keyword at start of text
    if (searchText.startsWith(keyword)) {
      confidence += 0.1;
    }

    // Longer keywords are more specific
    if (keyword.length > 10) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Batch categorize multiple transactions
   */
  static batchCategorize(
    transactions: Array<{
      description: string;
      vendor?: string;
      amount?: number;
    }>,
    customRules?: Array<{ category: string; keywords: string[] }>
  ): Array<CategoryMatch | null> {
    return transactions.map(t => 
      this.categorize(t.description, t.vendor, t.amount, customRules)
    );
  }

  /**
   * Get all available default categories
   */
  static getDefaultCategories(): string[] {
    return Object.keys(this.BUILT_IN_RULES);
  }

  /**
   * Get keywords for a specific category
   */
  static getCategoryKeywords(categoryName: string): string[] {
    return this.BUILT_IN_RULES[categoryName] || [];
  }

  /**
   * Test if a transaction matches a specific category
   */
  static matchesCategory(
    description: string,
    vendor: string | undefined,
    categoryName: string,
    customRules?: Array<{ category: string; keywords: string[] }>
  ): boolean {
    const match = this.categorize(description, vendor, undefined, customRules);
    return match?.categoryName === categoryName;
  }

  /**
   * Get suggestions for ambiguous transactions
   */
  static getSuggestions(
    description: string,
    vendor?: string,
    limit: number = 3
  ): CategoryMatch[] {
    const searchText = `${description} ${vendor || ''}`.toLowerCase().trim();
    const matches: CategoryMatch[] = [];

    // Check all categories
    for (const [categoryName, keywords] of Object.entries(this.BUILT_IN_RULES)) {
      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase().trim();
        if (keywordLower && searchText.includes(keywordLower)) {
          const confidence = this.calculateConfidence(searchText, keywordLower, false);
          if (confidence >= 0.4) {
            matches.push({
              categoryName,
              confidence,
              matchedKeyword: keyword
            });
            break; // One match per category is enough
          }
        }
      }
    }

    // Sort by confidence and return top N
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }
}


