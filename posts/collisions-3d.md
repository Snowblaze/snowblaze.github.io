---
title: "Game Engine Tutorial Series Part 6: Collisions in 3D"
excerpt: "Moving to 3D rendered our collision detection and resolution system non-functional. Fixing it requires understanding of a great amount of information. In this part we will discuss what is required, how can we implement it and what are the limitations of different approaches."
coverImage: "/Collisions3D/collisions-3d-cover.jpg"
date: "2023-06-24T00:00:00.000Z"
author: Arman Matinyan
ogImage: "/Collisions3D/collisions-3d-og.jpg"
readTime: "90 min"
previousSlug: "rotation"
previousTitle: "Part 5: Rigid Body"
---

Moving to 3D rendered our collision detection and resolution system non-functional. Fixing it requires understanding of a great amount
of information. In this part we will discuss what is required, how can we implement it and what are the limitations of different approaches.

The source code is available on GitHub at [https://github.com/Snowblaze-Studio/game-engine](https://github.com/Snowblaze-Studio/game-engine).
The final code for this part of the tutorial can be found under the tag "part-6-collisions-3d".

## Collision Detection

In a typical game, there are lots of objects, be it static or dynamic, that can collide with each other. In order to detect collisions
between all of them, we need to check each pair of objects. This is called a brute force approach and it is very inefficient. For example,
if we have 100 objects, we will need to perform 10000 checks. Besides that issue, each check may also be very time-consuming. Objects with
complex geometry may require a lot of calculations to determine if they are colliding or not. To fix these issues, let's divide the problem
into smaller parts. Firstly, we will do a crude check to determine if two objects are close enough to collide. If they are, we will perform
a more detailed check to determine if they are actually colliding. This is called *broad phase* and *narrow phase* respectively.

## Broad Phase

The goal of the broad phase is to quickly determine which pairs might collide. This set of pairs is then passed to the narrow phase for
further processing. There are two main approaches to broad phase collision detection: spatial partitioning and bounding volume hierarchies
(or BVH for short).

### Bounding Volume Hierarchies

Let's start with defining a bounding volume first. It is an area of space that fully contains the object. They may be represented in different
shapes: spheres, boxes, tetrahedrons, even octahedrons. The most common ones are spheres and boxes. Typically, the shape is chosen based on
how close-fitting to the object it is, so that when two bounding volumes collide, the objects inside them are more likely to also collide.
If there is a lot of empty space inside the bounding volume, then it may result in cases where the bounding volumes collide, but the objects
inside them do not. This is called a false positive. For this tutorial we will use spheres as bounding volumes, because they are easier to
implement and they are good enough for our needs. Let's create a file *bounding_sphere.hpp* and add a struct for it:

```cpp
#pragma once

#include "core.hpp"

#ifndef BOUNDING_SPHERE_HPP
#define BOUNDING_SPHERE_HPP

struct BoundingSphere
{
    Vector3 center;
    float radius;
};

#endif
```

To test if two spheres are colliding is pretty straightforward. We need to calculate the distance between their centers and check if it is
less than the sum of their radii. If it is, then they are colliding. Easy, right?

Now back to bounding volume hierarchies. They are tree-like structures that contain bounding volumes of objects. The root node contains a
bounding volume that contains all objects. Each child node contains a bounding volume that contains a subset of objects from the parent node.
The leaf nodes contain a single object. Usually, the tree is constructed by recursively splitting the objects into two groups.

If the bounding volumes of two nodes are not colliding, then none of the objects in those nodes can collide. If the bounding volumes are
colliding, then we need to check each pair of objects in those nodes. We recursively descend the hierarchy and only continue with those pairs that
are touching. This way we will get a list of the potential contacts. Time to implement it. Let's create a file *bvh.hpp* and add the following:

```cpp
#pragma once

#include "rigidbody.hpp"
#include "bounding_sphere.hpp"

#ifndef BOUNDING_VOLUME_HIERARCHY_HPP
#define BOUNDING_VOLUME_HIERARCHY_HPP

struct PotentialContact
{
    RigidBody* body[2];
};

class BVHNode
{
public:
    BVHNode* children[2];

    BoundingSphere volume;

    RigidBody* body;

    bool isLeaf() const
    {
        return body != nullptr;
    }

    unsigned getPotentialContacts(PotentialContact* contacts, unsigned limit) const
    {
        if (isLeaf() || limit == 0) return 0;

        return children[0]->getPotentialContactsWith(children[1], contacts, limit);
    }

protected:
    bool overlaps(const BVH* other) const
    {
        return volume->overlaps(other->volume);
    }

    unsigned getPotentialContactsWith(const BVHNode* other, PotentialContact* contacts, unsigned limit) const
    {
        if (!overlaps(other) || limit == 0) return 0;

        if (isLeaf() && other->isLeaf())
        {
            contacts->body[0] = body;
            contacts->body[1] = other->body;
            return 1;
        }

        if (other->isLeaf() || (!isLeaf() && volume->getSize() >= other->volume->getSize()))
        {
            unsigned count = children[0]->getPotentialContactsWith(other, contacts, limit);

            if (limit > count)
            {
                return count + children[1]->getPotentialContactsWith(other, contacts + count, limit - count);
            }
            else
            {
                return count;
            }
        }
        else
        {
            unsigned count = getPotentialContactsWith(other->children[0], contacts, limit);

            if (limit > count)
            {
                return count + getPotentialContactsWith(other->children[1], contacts + count, limit - count);
            }
            else
            {
                return count;
            }
        }
    }
};

#endif
```

Everything in this code block is self-explanatory, but let's elaborate on *getPotentialContactsWith* function. If both nodes are leaf nodes,
then we add the pair of objects to the list of potential contacts. If one of the nodes is a leaf node, then we recursively call the function
on the other node. If both nodes are not leaf nodes, then we check which node is bigger to descend into.

Now for the *overlaps* function to work, we need to implement it in the *BoundingSphere* struct. Let's update the struct to the following:

```cpp
#pragma once

#include <math.h>
#include "core.hpp"

#ifndef BOUNDING_SPHERE_HPP
#define BOUNDING_SPHERE_HPP

struct BoundingSphere
{
    Vector3 center;
    float radius;

public:
    BoundingSphere(const Vector3& center, float radius)
    {
        this.center = center;
        this.radius = radius;
    }

    BoundingSphere(const BoundingSphere& a, const BoundingSphere& b)
    {
        Vector3 centerOffset = b.center - a.center;
        // Squared distance between centers
        float distance = centerOffset.x * centerOffset.x + centerOffset.y * centerOffset.y + centerOffset.z * centerOffset.z;
        float radiusDiff = b.radius - a.radius;

        if (radiusDiff * radiusDiff >= distance)
        {
            if (a.radius > b.radius)
            {
                center = a.center;
                radius = a.radius;
            }
            else
            {
                center = b.center;
                radius = b.radius;
            }
        }
        else
        {
            distance = sqrt(distance);
            radius = (distance + a.radius + b.radius) * 0.5f;

            center = a.center;
            if (distance > 0)
            {
                center += centerOffset * ((radius - a.radius) / distance);
            }
        }
    }

    bool overlaps(const BoundingSphere* other) const
    {
        Vector3 centerOffset = center - other->center;
        float distanceSquared = centerOffset.x * centerOffset.x + centerOffset.y * centerOffset.y + centerOffset.z * centerOffset.z;

        return distanceSquared < (radius + other->radius) * (radius + other->radius);
    }
};

#endif
```

Here we check if the distance between the centers is less than the sum of the radii. If it is, then the spheres are colliding.

Only the actual hierarchy construction is missing. Considering the fact that the objects are moving, we need to rebuild the hierarchy every
frame. This isn't very efficient, so we need to find a way to update the hierarchy without rebuilding it. There are multiple approaches to
creating a BVH: top-down, bottom-um, insertion, etc. We will go with insertion. The idea is to start with an empty tree and insert the objects
one by one. We descend the tree and at each node we select a child that would best accommodate the object we are inserting. Upon reaching a
leaf node, we replace it by a new parent node with the leaf node and the new object as children. The most important part of the algorithm is
the selection of the child node to descend into. Let's make it simple:

```cpp
class BVHNode
{
public:
    // Other code here...
    
    BVHNode* parent;
    
    BVHNode(BVHNode* parent, const BoundingSphere& volume, RigidBody* body = nullptr) : parent(parent), volume(volume), body(body)
    {
        children[0] = children[1] = nullptr;
    }
    
    void insert(RigidBody* newBody, const BoundingSphere& newVolume)
    {
        if (isLeaf())
        {
            children[0] = new BVHNode(this, volume, body);
            children[1] = new BVHNode(this, newVolume, newBody);

            this->body = nullptr;

            recalculateBoundingVolume();
        }
        else
        {
            if (children[0]->volume.getGrowth(newVolume) < children[1]->volume.getGrowth(newVolume))
            {
                children[0]->insert(newBody, newVolume);
            }
            else
            {
                children[1]->insert(newBody, newVolume);
            }
        }
    }

protected:
    // Other code here...

    void recalculateBoundingVolume()
    {
        if (isLeaf()) return;

        // Use the bounding volume combining constructor.
        volume = BoundingSphere(children[0]->volume, children[1]->volume);

        // Recurse up the tree
        if (parent) parent->recalculateBoundingVolume();
    }
```

The logic here is, we insert the new object into the child node that would grow the least. After adding a new object to the tree, we
need to update the bounding volumes of the nodes. We do this recursively going up the tree.

Let's add the missing *getGrowth* function, which determines how much the bounding sphere should grow to accommodate the given sphere,
to the *BoundingSphere* struct.  

```cpp
struct BoundingSphere
{
public:
    // Other code here...

    float getGrowth(const BoundingSphere& other) const
    {
        BoundingSphere newSphere(*this, other);

        return newSphere.radius * newSphere.radius - radius * radius;
    }
};
```

Okay, so adding objects to the tree is done. Now we need the capability to remove them. This is pretty easy as well. If we want to remove
a leaf node, we just need to replace its parent with its sibling. Well, we also need to update the bounding volumes of the nodes up the tree.

```cpp
class BVHNode
{
public:
    // Other code here...

    ~BVHNode()
    {
        if (parent)
        {
            BVHNode* sibling;
            if (parent->children[0] == this) sibling = parent->children[1];
            else sibling = parent->children[0];

            parent->volume = sibling->volume;
            parent->body = sibling->body;
            parent->children[0] = sibling->children[0];
            parent->children[1] = sibling->children[1];

            sibling->parent = nullptr;
            sibling->body = nullptr;
            sibling->children[0] = nullptr;
            sibling->children[1] = nullptr;
            delete sibling;

            parent->recalculateBoundingVolume();
        }

        if (children[0]) {
            children[0]->parent = nullptr;
            delete children[0];
        }
        if (children[1]) {
            children[1]->parent = nullptr;
            delete children[1];
        }
    }
};
```

That's it for BVHs. There are other data structures worth discussing, such as BSP trees, quad-trees, oct-trees and many more, but we will
leave them for another time.

## Narrow Phase

After we have found the potential contacts, we need to check if they are actually colliding. This is called the **narrow phase**. There are
multiple ways to do this, but we will go with the most common one - the **Separating Axis Theorem**. The idea is to find a separating axis


### Shapes


### Contacts

### Collision Algorithms

## Collision Resolution

## Demo

## Closing

With this our physics engine is finished to some extent. There is still a lot of room for improvement, like implementing resting contacts,
constraints (joints, springs, etc.), simultaneous collision resolution, simulation islands and many more. What we have is good enough for our needs.
In the near future we will be replacing our rendering library to a different one, which will allow us to render our game in 3D.

Thanks for reading and if you have any thoughts/questions, I would love to hear them on twitter [@Snowblazed](https://twitter.com/Snowblazed).
