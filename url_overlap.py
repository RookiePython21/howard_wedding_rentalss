def should_combine_keywords(
    serp1: list[str],
    serp2: list[str],
    threshold: float = 0.20,
) -> bool:
    if not serp1:
        return False

    overlap = len(set(serp1) & set(serp2)) / len(set(serp1))
    return overlap > threshold