# Animeal (volunteer project)
Project for IT specialists who are interested in spending their free time to help people and make the world a better place.

## What was done
I conducted full-cycle performance testing using the following approach:
1. Examined the non-functional requirements to understand the performance expectations for the system.
2. Designed scenarios and load models that accurately simulate real-world usage patterns and accurately represent user behavior.
3. Created the necessary environments for the load generator.
4. Conducted server-side tests, such as ramp-up, fixed load, and soak, to evaluate the performance of the system under different load conditions.
5. Analyzed the results of the tests to identify performance issues and areas for improvement, and to validate whether the system meets the non-functional requirements.
6. Prepared a comprehensive report.


## How to run
Enter the following command in your terminal/console:
```
jmeter -n -t ../../scripts/script.jmx -p ../../scripts/.properties
```
