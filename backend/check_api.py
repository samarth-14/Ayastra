with open(r'C:\Users\samarth\ayastra\frontend\src\api\api.ts', encoding='utf-8') as f:
    c = f.read()
idx = c.find('getOrders')
print(c[idx:idx+200])