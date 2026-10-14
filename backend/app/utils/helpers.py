def get_loyalty_tier(points: int) -> str:
    if points >= 20000: return "Platinum"
    if points >= 5000:  return "Gold"
    if points >= 1000:  return "Silver"
    return "Basic"


def calc_points_earned(amount: float, tier: str) -> int:
    rates = {"Basic": 1.0, "Silver": 1.5, "Gold": 2.0, "Platinum": 3.0}
    return int(amount * rates.get(tier, 1.0))


def get_stock_status(qty: int, min_stock: int) -> str:
    if qty <= 0:         return "Out of Stock"
    if qty <= min_stock: return "Low Stock"
    return "In Stock"


def paginate(query, page: int = 1, size: int = 20):
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return {
        "total": total,
        "page":  page,
        "size":  size,
        "pages": (total + size - 1) // size,
        "items": items,
    }