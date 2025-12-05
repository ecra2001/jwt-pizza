# Self Attack

## Elijah Cramer Self Attack
Date: 12/4/2025
Target: pizza.cs329jwtpizza.click
Classification: Broken Access Control
Severity: 4
Description: Tried to alter JWT Token to make Role = Admin. Result was unauthorized.
Images:
![description of screenshot](images/Screenshot%202025-12-04%20at%204.09.58 PM.png)
Correction: None

## Elijah Parker Self Attack
Date: 12/4/2025
Target: pizza.dunemask.org
Classification: Insecure Design
Severity: 4
Description: Check to see if he could get the admin password from the Github action report. He successfully made it so he couldn't because he changed the password field into an environmental variable.
Images:
Was not able to get an image from him.
Correction: None

# Peer Attack

## Elijah Cramer on Elijah Parker
Date: 12/4/2025
Target: pizza.dunemask.org
Classification: Identification and Authentication Failures
Severity: 4
Description: Spammed a bunch of unauthorized login requests to see how it would handle it. It handled it fine and can still login to his own user successfully.
Images:
![description of screenshot](images/Screenshot%202025-12-04%20at%205.30.58 PM.png)
Correction: None

## Elijah Parker on Elijah Cramer
Date: 12/4/2025
Target: pizza.cs329jwtpizza.click
Classification: Insecure Design
Severity: 1
Description: Was able to find my admin password through my Github deployment and deleted my stores and even deleted my admin account.
Images:
![description of screenshot](images/Screenshot%202025-12-04%20at%203.38.32 PM.png)
Correction: Change my admin credentials to environmental variables.

# Learnings

We learned the importance of protecting important credentials, such as making them environmental variables on Github so that they can never be accessed by anyone.