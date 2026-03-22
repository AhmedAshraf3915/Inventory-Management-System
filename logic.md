# Utility functions should contain

Utility functions should contain only **small reusable logic** that can work across more than one page and is **not tied to HTML or DOM**.

They should usually contain:

- inputs as parameters
- pure logic
- returned result
- no direct page manipulation
- no fetch requests
- no rendering

---

# What utilities you need in your inventory project

## 1. `searchData`

Should contain:

- data array
- search term
- field name or fields
- filtering logic
- return filtered array

Use it for:

- products
- categories
- suppliers

---

## 2. `sortData`

Should contain:

- data array
- sort field
- sort direction
- comparison logic
- return sorted copy

Use it for:

- name
- price
- quantity
- date

---

## 3. `getStockStatus`

Should contain:

- quantity
- minStock
- logic for:
  - `in_stock`
  - `low_stock`
  - `out_of_stock`

- return status string

Use it when:

- adding product
- editing product
- displaying stock state

---

## 4. `findById`

Should contain:

- array
- id
- lookup logic
- return matching object

Use it for:

- category from `categoryId`
- supplier from `supplierId`

---

## 5. `formatDate`

Should contain:

- date input
- formatting logic
- return formatted date string

Use it for:

- created date
- displayed dates in tables/cards

---

## 6. `calculateStats`

Should contain:

- data array
- counting/summing logic
- return calculated values

Use it for dashboard cards such as:

- total products
- low stock count
- out of stock count
- total stock quantity
- total inventory value

---

## 7. `paginateData`

Yes, pagination fits very well in utilities.

It should contain:

- data array
- current page
- items per page
- start index calculation
- end index calculation
- sliced result
- return paginated data

Use it for:

- products table
- suppliers table
- categories table

---

# Why pagination belongs in utilities

Because pagination is:

- reusable
- data-based
- not tied to one page
- not tied to HTML

It only processes arrays and returns part of them.

That makes it a perfect utility.

---

# What pagination utility should do

It should only do:

- receive full data
- calculate which items belong to current page
- return only those items

Optionally, it may also return pagination info like:

- total items
- total pages
- current page

---

# Example summary of pagination utility responsibility

## `paginateData(data, currentPage, itemsPerPage)`

Should contain:

- calculation:
  - `startIndex`
  - `endIndex`

- `slice()`
- return paginated items

---

# Clean final list

# Very short rule for utilities

A utility function should:

- solve one small shared problem
- accept data through parameters
- return a result
- avoid UI and API work
