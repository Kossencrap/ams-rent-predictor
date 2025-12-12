import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor

RNG_SEED = 42

def generate_dataset(n: int = 2000) -> pd.DataFrame:
    rng = np.random.default_rng(RNG_SEED)

    # Features (plausibel, synthetisch)
    m2 = rng.lognormal(mean=4.3, sigma=0.35, size=n).clip(30, 200)
    inhoud = m2 * rng.uniform(2.6, 3.0, size=n)
    kamers = np.maximum(1, np.round(m2 / 22)).astype(int)
    badkamers = rng.choice([1, 2], size=n, p=[0.75, 0.25])
    woonlagen = rng.choice([1, 2, 3, 4], size=n, p=[0.35, 0.35, 0.2, 0.1])
    has_outdoor = rng.binomial(1, 0.45, size=n)
    buitenruimte = has_outdoor * rng.gamma(shape=2.0, scale=6.0, size=n)

    # Target (log-hedonic + noise)
    log_rent = (
        3.2
        + 0.65 * np.log(m2)
        + 0.04 * np.sqrt(buitenruimte)
        + 0.06 * kamers
        + 0.12 * (badkamers > 1)
        + 0.03 * woonlagen
        + rng.normal(0, 0.18, size=n)
    )
    huurprijs = np.exp(log_rent).clip(700, 5500)

    return pd.DataFrame({
        "huurprijs_eur": np.round(huurprijs, 0),
        "vierkante_meter": np.round(m2, 1),
        "inhoud_m3": np.round(inhoud, 0),
        "buitenruimte_m2": np.round(buitenruimte, 1),
        "aantal_badkamers": badkamers,
        "aantal_kamers": kamers,
        "aantal_woonlagen": woonlagen,
    })

def main() -> None:
    df = generate_dataset(3000)

    X = df[[
        "vierkante_meter",
        "inhoud_m3",
        "buitenruimte_m2",
        "aantal_badkamers",
        "aantal_kamers",
        "aantal_woonlagen",
    ]]
    y = np.log(df["huurprijs_eur"].astype(float))

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=RNG_SEED
    )

    model = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.8,
        random_state=RNG_SEED,
    )
    model.fit(X_train, y_train)

    joblib.dump(model, "rent_model.joblib")
    df.to_csv("synthetic_amsterdam_rentals.csv", index=False)

    print("✅ Saved: rent_model.joblib")
    print("✅ Saved: synthetic_amsterdam_rentals.csv")

if __name__ == "__main__":
    main()
