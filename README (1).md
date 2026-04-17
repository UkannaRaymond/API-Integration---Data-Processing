# Gender Classification API

A lightweight REST API that predicts the gender of a given first name using the [Genderize.io](https://genderize.io) service. Built with Node.js and deployed as a serverless function on Vercel.

---

## Live Base URL

```
https://api-integration-and-data-processing.vercel.app/
```

---

## Endpoint

### `GET /api/classify`

Predicts the gender associated with a given first name.

#### Query Parameters

| Parameter | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| `name`    | string | Yes      | The first name to classify |

#### Example Request

```
GET /api/classify?name=John
```

---

## Response Format

All responses are returned as JSON.

### Success Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 123456,
    "is_confident": true,
    "processed_at": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Response Fields

| Field          | Type    | Description                                                              |
| -------------- | ------- | ------------------------------------------------------------------------ |
| `name`         | string  | The name that was classified                                             |
| `gender`       | string  | Predicted gender — `"male"` or `"female"`                                |
| `probability`  | number  | Confidence score between `0` and `1`                                     |
| `sample_size`  | number  | Number of data points used to make the prediction                        |
| `is_confident` | boolean | `true` if probability ≥ 0.7 **and** sample size ≥ 100, otherwise `false` |
| `processed_at` | string  | ISO 8601 timestamp of when the request was processed                     |

---

### Error Responses

| Status | Message                                       | Cause                                    |
| ------ | --------------------------------------------- | ---------------------------------------- |
| `400`  | Missing or empty name parameter               | `name` query param was not provided      |
| `200`  | No prediction available for the provided name | Genderize has no data for the given name |
| `405`  | Method not allowed                            | A non-GET request was made               |
| `422`  | Name must be a string                         | Invalid `name` value type                |
| `502`  | Failed to reach Genderize API                 | Upstream Genderize API is unreachable    |

#### Error Response Body

```json
{
  "status": "error",
  "message": "Missing or empty name parameter"
}
```

---

## Project Structure

```
├── api/
│   └── classify.js     # Serverless function handler
├── vercel.json         # Vercel routing configuration
└── README.md
```

---

## Running Locally

**Prerequisites:** Node.js and npm installed.

**1. Install the Vercel CLI:**

```bash
npm install -g vercel
```

**2. Clone the repository and navigate into it:**

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

**3. Start the local development server:**

```bash
vercel dev
```

**4. Test the endpoint:**

```bash
curl "http://localhost:3000/api/classify?name=John"
```

---

## Deploying to Vercel

**1. Login to Vercel:**

```bash
vercel login
```

**2. Deploy to production:**

```bash
vercel --prod
```

After deployment, your public API base URL will be:

```
https://your-project-name.vercel.app
```

---

## Example Test Cases

| Request                        | Expected Outcome                  |
| ------------------------------ | --------------------------------- |
| `/api/classify?name=John`      | Success — male, high confidence   |
| `/api/classify?name=Mary`      | Success — female, high confidence |
| `/api/classify?name=Zyxwvut`   | No prediction available           |
| `/api/classify`                | 400 — Missing name parameter      |
| `POST /api/classify?name=John` | 405 — Method not allowed          |

---

## Dependencies

- **Node.js** built-in `https` module — no external packages required
- **[Genderize.io API](https://genderize.io)** — third-party gender prediction service (free tier available)

## 👤 Author

Ukanna Raymond | Frontend | Backend |

This project is part of my portfolio, showcasing the backend skill for a fullstack role. If you have any questions, feedback, or would like to collaborate, feel free to get in touch!
