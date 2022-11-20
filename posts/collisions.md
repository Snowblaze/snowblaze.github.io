---
title: "Game Engine Tutorial Series Part 3: Collisions"
excerpt: "In a game world, engineers try to explicitly ensure that objects don't pass through each other. To accomplish that, they implement one of the primary components of a physics engine - collision system."
coverImage: "/Collisions/collisions-cover.jpg"
date: "2022-12-04T17:00:00.000Z"
author: Arman Matinyan
ogImage: "/Collisions/collisions-og.jpg"
readTime: "20 min"
previousSlug: "simple-physics"
previousTitle: "Part 2: Simple Physics"
---

In a game world, engineers try to explicitly ensure that objects don't pass through each other.
To accomplish that, they implement one of the primary components of a physics engine - **collision system**.
With the system in place, we can simulate bouncing objects off one another, sliding and coming to rest and other physical behaviors.
This part's focus lies on creating a simple collision detection and resolution mechanism for particle physics,
and making our character (square) stand on the ground (bottom border of the window).

The source code is available on GitHub at [https://github.com/Snowblaze-Studio/game-engine](https://github.com/Snowblaze-Studio/game-engine).
The final code for this part of the tutorial can be found under the tag "part-3-collisions".

## Groundwork

Before deep diving into collisions, we need to add a little more functionality to our *Vector* and *Particle* classes.

First, let's start with *Vector*. Add a way to zero out a vector instance and a couple of arithmetic operators in *Core.hpp*.

```cpp
#pragma once

#ifndef CORE_HPP // include guard
#define CORE_HPP

class Vector2
{
public:
    // Other code here...
    const static Vector2 UP;

    void clear()
    {
        x = y = 0;
    }

    void operator+=(const Vector2& vector)
    {
        x += vector.x;
        y += vector.y;
    }

    Vector2 operator+(const Vector2& vector) const
    {
        return Vector2(x + vector.x, y + vector.y);
    }

    void operator-=(const Vector2& vector)
    {
        x -= vector.x;
        y -= vector.y;
    }

    Vector2 operator-(const Vector2& vector) const
    {
        return Vector2(x - vector.x, y - vector.y);
    }

    Vector2 operator*(const float value) const
    {
        return Vector2(x * value, y * value);
    }

    float operator*(const Vector2& vector) const
    {
        return x * vector.x + y * vector.y;
    }
};

#endif
```

Also, it would be convenient to have a static vector pointing in positive Y direction. *Core.cpp* should look like this:

```cpp
#include "include/core.hpp"

const Vector2 Vector2::GRAVITY = Vector2(0, -9.81f);
const Vector2 Vector2::UP = Vector2(0, 1.0f);
```

As for the *Particle*, some convenience methods are required in *Particle.hpp*.

```cpp
#pragma once

#ifndef PARTICLE_HPP // include guard
#define PARTICLE_HPP

#include "core.hpp"
#include <assert.h>
#include <corecrt_math.h>

class Particle
{
protected:
    // Other code here...

public:
    // Other code here...

    void getAcceleration(Vector2* accPtr) const
    {
        *accPtr = acceleration;
    }

    Vector2 getAcceleration() const
    {
        return acceleration;
    }

    float getInverseMass() const
    {
        return inverseMass;
    }

    void setVelocity(const Vector2& velPtr)
    {
        velocity = velPtr;
    }

    void setVelocity(const float x, const float y, const float z)
    {
        velocity.x = x;
        velocity.y = y;
    }

    void getVelocity(Vector2* velPtr) const
    {
        *velPtr = velocity;
    }

    Vector2 getVelocity() const
    {
        return velocity;
    }
};

#endif
```

## Simple Collision Resolution

When two objects collide, their movement after the collision can be calculated from their movement before the collision.
This process is called **collision resolution**. Since the collision happens in a very small amount of time,
we will be directly setting the resulting velocity and possibly its position.

One of the key properties related to collision resolution is the **closing velocity**. It is a quantity representing
the total velocity of two objects and is calculated with the following equation:

$$
v_c = \dot{p}_a ⋅ (\widehat{p_b - p_a}) + \dot{p}_b ⋅ (\widehat{p_a - p_b})
$$

where $p_a$ and $p_b$ are object positions, dot ($⋅$) is the dot product, and $\widehat{p}$ is the unit length vector in the direction of $p$.
Closing velocity is a scalar quantity. If it's negative, then the objects are closing in on each other, otherwise if it's positive,
then the objects are separating.

$$
v_c = -(\dot{p}_a - \dot{p}_b) ⋅ (\widehat{p_a - p_b})
$$

Changing the sign will give the separating velocity instead.

$$
v_s = (\dot{p}_a - \dot{p}_b) ⋅ (\widehat{p_a - p_b})
$$

Another important property is **restitution**. Newton's law of restitution states that when two bodies collide,
the speed with which they move after the collision actually depends on the material from which they are made.
The coefficient of restitution tells us about the bounciness, or elasticity, of the collision.
It describes how much energy is lost during the collision.
When restitution is equal to 1, the collision is perfectly elastic, and no energy is lost.
So the objects will bounce off each other.
When it's 0, the collision is inelastic (plastic), and the kinetic energy of both objects is lost.
The objects will stick and travel together.

The collision analysis is based around the idea that the momentum is conserved, as in:

$$
m_a\dot{p}_a + m_b\dot{p}_b = m_a\dot{p}_a' + m_b\dot{p}_b'
$$

where $m_a$ is the mass of object $a$, $\dot{p}_a$ is the velocity of object $a$ before the collision, and $\dot{p}_a'$ is the velocity after the collision.

This gives us information about total velocity before and after the collision, but what about objects' individual velocities?
The key relationship between their relative velocities is provided by the coefficient of restitution.

$$
v_s' = -cv_s
$$

### Contact Normal

We have only considered 2 objects colliding, but what happens when the collision is between an object and something not physically simulated?
For example, some level bounds like a wall or ground. In this case, we don't have a definite position, and we can't use the $(\widehat{p_a - p_b})$
term. This term gives us the direction in which the separating velocity acts upon, so instead of calculating we can just explicitly get it from
those bounds. This direction vector is called **contact normal**, and as it is a direction, its length is always equal to 1.

When two particles collide, the contact normal is given by:

$$
\widehat{n} = (\widehat{p_a - p_b})
$$

This normal is given from object $a$'s perspective. For object $b$ we will be changing the sign by multiplying the direction by -1.

Let's imagine our ground being horizontally aligned and level all the way. When a particle collides with it, the normal will be:

$$
\widehat{n} = \begin{bmatrix} 0 \\ 1 \\ 0 \end{bmatrix}
$$

Now, our equation for separating velocity becomes:

$$
v_s = (\dot{p}_a - \dot{p}_b) ⋅ \widehat{n}
$$

To resolve a collision using the law of restitution, we will apply an **impulse** to the objects. An impulse is an instantaneous change
in the velocity. For forces we have the following equation:

$$
f = m\ddot{p}
$$

And for impulses:

$$
g = m\dot{p}
$$

Previously, we have combined all the forces using D'Alembert's principle to get the total acceleration. We can also use the same principle
for combining the impulses, but the result is not the total velocity, but the total change in velocity:

$$
\dot{p}' = \dot{p} + \frac{1}{m} \sum_n g_i
$$

where $g_1$, ..., $g_n$ are all the impulses acting on the object.

At the end of our collision resolution process we will have an impulse to apply to each object, which will instantly change its velocity.

That was a great deal of info to process, but fortunately that's most of it, and we can finally start implementing it in our engine.

## Collision Resolution

To define a collision we will create a class named *ParticleContact* in *physics-engine/include/pcontact.hpp*:

```cpp
#pragma once

#ifndef PCONTACT_HPP // include guard
#define PCONTACT_HPP

#include "particle.hpp"

class ParticleContact
{
public:
    Particle* particle[2];

    float restitution;

    Vector2 contactNormal;
}

#endif
```

The contact will have pointers to the objects in question, a contact normal and the coefficient of restitution. Whenever the collision will be
between an object and level bounds (wall, ground, etc.), the second pointer will be NULL.

Let's add a *resolve* function for collision resolution and another one for calculating the separating velocity.

```cpp
class ParticleContact
{
public:
    // Other code here...
    
protected:
    void resolve(float duration);

    float calculateSeparatingVelocity() const;

private:
    void resolveVelocity(float duration);
}
```

The *resolveVelocity* function is for handling impulse calculations. Put the implementation of these functions in *physics-engine/particle.cpp*
as follows:

```cpp
#include "include/pcontact.hpp"

void ParticleContact::resolve(float duration)
{
    resolveVelocity(duration);
}

float ParticleContact::calculateSeparatingVelocity() const
{
    Vector2 relativeVelocity = particle[0]->getVelocity();
    if (particle[1]) relativeVelocity -= particle[1]->getVelocity();
    return relativeVelocity * contactNormal;
}

void ParticleContact::resolveVelocity(float duration)
{
    float separatingVelocity = calculateSeparatingVelocity();

    // The contact is either separating or stationary so no impulse is required.
    if (separatingVelocity > 0)
    {
        return;
    }

    // New separating velocity.
    float newSepVelocity = -separatingVelocity * restitution;

    // Take acceleration buildup into account (also solves resting contacts problem)
    Vector2 accCausedVelocity = particle[0]->getAcceleration();
    if (particle[1]) accCausedVelocity -= particle[1]->getAcceleration();
    float accCausedSepVelocity = accCausedVelocity * contactNormal * duration;

    // If we’ve got a closing velocity due to aceleration buildup, remove it from the new separating velocity.
    if (accCausedSepVelocity < 0)
    {
        newSepVelocity += restitution * accCausedSepVelocity;

        if (newSepVelocity < 0) newSepVelocity = 0;
    }

    float deltaVelocity = newSepVelocity - separatingVelocity;

    float totalInverseMass = particle[0]->getInverseMass();
    if (particle[1]) totalInverseMass += particle[1]->getInverseMass();

    // Impulses have no effect if both objects have infinite mass
    if (totalInverseMass <= 0) return;

    float impulse = deltaVelocity / totalInverseMass;

    // Impulse per unit of inverse mass.
    Vector2 impulsePerIMass = contactNormal * impulse;

    // Apply impulses
    particle[0]->setVelocity(particle[0]->getVelocity() + impulsePerIMass * particle[0]->getInverseMass());
    if (particle[1])
    {
        // Second object goes in the opposite direction
        particle[1]->setVelocity(particle[1]->getVelocity() + impulsePerIMass * -particle[1]->getInverseMass());
    }
}
```

### Interpenetration

Due to colliding the objects may interpenetrate, so we need a way to separate them. Let's add a field to our *ParticleContact* class,
that holds the information about how far the objects have interpenetrated.

```cpp
class ParticleContact
{
public:
    // Other code here...

    float penetration;
}
```

Negative value means that the objects are not interpenetrating, zero - objects are just touching. If the value is positive,
the objects are interpenetrating, and after moving them in the direction of the contact normal by that amount, they will no longer be in contact.

Now we got ourselves a problem, how do we determine how much each object should be moved? Simply moving each object by half of the
interpenetration depth is not believable. We have to take into account the objects' masses. The object with greater mass will move less,
than the other one.

Penetration depth is equal to the total distance the objects moved:

$$
\Delta{p_a} + \Delta{p_b} = d
$$

As the distances are proportional to their masses, we get the following:

$$
m_a\Delta{p_a} = m_b\Delta{p_b}
$$

Combining the above two, we get:

$$
\Delta{p_a} = \frac{m_b}{m_a + m_b}d
$$

$$
\Delta{p_b} = \frac{m_a}{m_a + m_b}d
$$

Until this point we were dealing with scalar values, but to get the total change in the vector position, we need to use the contact normal:

$$
\Delta{p_a} = \frac{m_b}{m_a + m_b}dn
$$

$$
\Delta{p_b} = -\frac{m_a}{m_a + m_b}dn
$$

where $n$ is the contact normal.

Let's add a *resolveInterpenetration* function to our contact class in *pcontact.hpp*:

```cpp
class ParticleContact
{
public:
    // Other code here...
    
    Vector2 particleMovement[2];
private:
    // Other code here...
    
    void resolveInterpenetration(float duration);
}
```

The implementation and function call in *pcontact.cpp*:

```cpp
void ParticleContact::resolve(float duration)
{
    // Other code here...

    resolveInterpenetration(duration);
}

void ParticleContact::resolveInterpenetration(float duration)
{
    // If objects don't penetrate, skip this step.
    if (penetration <= 0) return;

    float totalInverseMass = particle[0]->getInverseMass();
    if (particle[1]) totalInverseMass += particle[1]->getInverseMass();
    
    // If both objects have infinite mass, then we do nothing.
    if (totalInverseMass <= 0) return;

    // Movement per unit of inverse mass.
    Vector2 movePerIMass = contactNormal * (penetration / totalInverseMass);
    
    // Calculate movement per object.
    particleMovement[0] = movePerIMass * particle[0]->getInverseMass();

    if (particle[1])
    {
        particleMovement[1] = movePerIMass * -particle[1]->getInverseMass();
    }
    else
    {
        particleMovement[1].clear();
    }

    // Apply the movement.
    particle[0]->setPosition(particle[0]->getPosition() + particleMovement[0]);

    if (particle[1])
    {
        particle[1]->setPosition(particle[1]->getPosition() + particleMovement[1]);
    }
}
```

To process collisions and update particles, let's create a class named *ContactResolver* in *physics-engine/include/pcontactresolver.hpp*.

```cpp
#pragma once

#ifndef PCONTACTRESOLVER_HPP // include guard
#define PCONTACTRESOLVER_HPP

#include "pcontact.hpp"

class ParticleContactResolver
{
public:
    ParticleContactResolver(unsigned iterations);

    void resolveContacts(ParticleContact* contactArray, unsigned numContacts, float duration);
};

#endif
```

Given an array of collisions, our class will resolve them both for penetration and velocity. But what will happen if resolving a collision
generates another one? To keep it simple, we will calculate the separating velocity for each collision, find the lowest one and, if it's less
than zero, process it. If by any chance new collisions were generated in this process, start again. It would be wise to set a predetermined
maximum number of iterations, so that the resolution process doesn't take too long.

Add the required declarations to *pcontactresolver.hpp*:

```cpp
class ParticleContactResolver
{
protected:
    unsigned iterations;

    unsigned iterationsUsed;

public:
    // Other code here...

    void setIterations(unsigned iterations);
};
```

Now implement the functions in *physics-engine/pcontactresolver.cpp*.

```cpp
#include "include/pcontact.hpp"
#include "include/pcontactresolver.hpp"
#include <limits>

ParticleContactResolver::ParticleContactResolver(unsigned iterations) : iterations(iterations) {}

void ParticleContactResolver::setIterations(unsigned iterations)
{
    ParticleContactResolver::iterations = iterations;
}

void ParticleContactResolver::resolveContacts(ParticleContact* contactArray, unsigned numContacts, float duration)
{
    unsigned i;
    iterationsUsed = 0;
    while (iterationsUsed < iterations)
    {
        // Find the contact with the lowest separating velocity
        float max = std::numeric_limits<float>::max();
        unsigned maxIndex = numContacts;
        for (i = 0; i < numContacts; i++)
        {
            float sepVel = contactArray[i].calculateSeparatingVelocity();
            if (sepVel < max && (sepVel < 0 || contactArray[i].penetration > 0))
            {
                max = sepVel;
                maxIndex = i;
            }
        }

        // Terminate if none were found
        if (maxIndex == numContacts) break;

        contactArray[maxIndex].resolve(duration);
        iterationsUsed++;
    }
}
```

## Collision Detection

While we now have a way to resolve a collision, we can't determine if there are any collisions at all. To accomplish that, we will need
systems that generate collisions based on some logic. Let's create an interface for such systems in *physics-engine/include/pcontactgenerator.hpp*.

```cpp
#pragma once

#ifndef PCONTACTGENERATOR_HPP // include guard
#define PCONTACTGENERATOR_HPP

#include "pcontact.hpp"

class ParticleContactGenerator
{
public:
    virtual unsigned addContact(ParticleContact* contact, unsigned limit) const = 0;
};

#endif
```

Now we are able to create a ground collision detector in *physics-engine/include/groundcontact.hpp*.

```cpp
#pragma once

#ifndef GROUNDCONTACT_HPP // include guard
#define GROUNDCONTACT_HPP

#include <vector>
#include "particle.hpp"
#include "pcontact.hpp"
#include "pcontactgenerator.hpp"

class GroundContact : public ParticleContactGenerator
{
public:
    void init(std::vector<Particle*> particles);

    virtual unsigned addContact(ParticleContact* contact, unsigned limit) const;

private:
    std::vector<Particle*> particles;
};

#endif
```

And the *addContact* implementation in *physics-engine/groundcontact.cpp*.

```cpp
#include "include/groundcontact.hpp"

void GroundContact::init(std::vector<Particle*> particles)
{
    GroundContact::particles = particles;
}

unsigned GroundContact::addContact(ParticleContact* contact, unsigned limit) const
{
    unsigned count = 0;
    for (auto p = particles.begin(); p != particles.end(); p++)
    {
        float y = (*p)->getPosition().y;
        if (y < 0.0f)
        {
            contact->contactNormal = Vector2::UP;
            contact->particle[0] = *p;
            contact->particle[1] = NULL;
            contact->penetration = -y;
            contact->restitution = 0.2f;
            contact++;
            count++;
        }

        if (count >= limit) return count;
    }
    return count;
}
```

Every frame we will call the *addContact* function of each generator to try to generate collisions, and, if any were generated, add them
to *contacts* array. We will also need an array to hold all the particles of our game, a list of all generators, a function to iterate
through all generators, a collision resolver and a maximum number of collisions. Let's edit our *Game* class.

```cpp
#pragma once

#ifndef GAME_HPP // include guard
#define GAME_HPP

#include <vector>
#include <SDL.h>

#include <particle.hpp>
#include <pcontactresolver.hpp>
#include <pcontactgenerator.hpp>

class Game
{
public:
	Game();

	// Initialize the game
	bool Initialize();

	// Run the game loop
	void RunLoop();

	// Cleanup and shut down the game
	void Shutdown();

private:
	void ProcessInput();

	void UpdateGame();

	void GenerateOutput();

	unsigned generateContacts();

	SDL_Window* mWindow;

	SDL_Renderer* mRenderer;

	Uint32 mTicksCount;

	bool mIsRunning;

	std::vector<Particle*> particles;

	Particle* mCharacter;

	ParticleContactResolver* resolver;

	std::vector<ParticleContactGenerator*> contactGenerators;

	ParticleContact* contacts;

	unsigned maxContacts;
};

#endif
```

Include *groundcontact.hpp* in *game.cpp*.

```cpp
#include <groundcontact.hpp>
```

Set the maximum number of collisions to 10.

```cpp
Game::Game() : mWindow(nullptr), mRenderer(nullptr), mTicksCount(0), mIsRunning(true), maxContacts(10) {}
```

Add our character particle to the array that holds all particles of our game, create the collision generation and resolution systems.

```cpp
bool Game::Initialize()
{
	// Other code here...

	resolver = new ParticleContactResolver(5);

    // As before
	mCharacter = new Particle();

	float x = (1024.0f - 100.0f) / 2.0f;
	float y = (768.0f - 100.0f) / 2.0f;

	mCharacter->setPosition(x, y);
	mCharacter->setMass(1.0);
	mCharacter->setAcceleration(Vector2::GRAVITY);
	mCharacter->setDamping(0.99);

	particles.push_back(mCharacter);

	GroundContact* groundContactGenerator = new GroundContact();
	groundContactGenerator->init(particles);
	contactGenerators.push_back(groundContactGenerator);

	contacts = new ParticleContact[maxContacts];

	return true;
}
```

Iterate through all the generators and get new collisions.

```cpp
unsigned Game::generateContacts()
{
	unsigned limit = maxContacts;
	ParticleContact* nextContact = contacts;

	for (std::vector<ParticleContactGenerator*>::iterator g = contactGenerators.begin(); g != contactGenerators.end(); g++)
	{
		unsigned used = (*g)->addContact(nextContact, limit);
		limit -= used;
		nextContact += used;

		// Maximum number of collisions reached
		if (limit <= 0) break;
	}

	// Return the current number of collisions
	return maxContacts - limit;
}
```

And finally resolve all the collisions.

```cpp
void Game::UpdateGame()
{
	// Other code here...

	unsigned usedContacts = generateContacts();

	if (usedContacts)
	{
		resolver->setIterations(usedContacts * 2);
		resolver->resolveContacts(contacts, usedContacts, deltaTime);
	}
}
```

Lastly, for all of this to work we need to add the newly created *cpp* files to our physics library's *CMakeLists.txt* in the *external/physics-engine* like so:

```cmake
# CMakeList.txt : CMake project for game-engine, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.21)

add_library (PhysicsEngine core.cpp pcontact.cpp pcontactresolver.cpp groundcontact.cpp)
```

## Closing

After successfully implementing the particle collision detection and resolution system, we will move on to transforming our physics library from particle to rigid-body dynamics. So, in the next chapter we will be refactoring our physics and getting ready to changing our rendering API. 

Thanks for reading and if you have any thoughts/questions, I would love to hear them on twitter [@Snowblazed](https://twitter.com/Snowblazed).

