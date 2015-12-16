; (use-student-values-fact TRUE)
; (use-problem-summary TRUE)
;(set-maximum-chain-depth 7)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;
;;  This file contains some possibly incomplete templates for the Mendel Backwards Problem Solving Tutor
;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; The file contains all templates that are needed, so no need to create new ones, but the templates
;;    that are provided may not have all the slots that are necessary.

(deftemplate state-pair
    (slot student-state)
    (slot real-state)
    )

(deftemplate transition
    (slot event)
    (slot action)
    (slot prev-state)
    (slot next-state)
    (slot filled)
    )

(deftemplate problem
    (slot name)
    (slot subGoal)
    (slot total-state)
    (slot count-state)
    (slot transition-count)
    (multislot curr-transitions)
    (multislot curr-states)
    (multislot end-state)
    (multislot ie-states)
    (multislot ie-events)
    (multislot ie-actions)   
        )

(deftemplate interface-element
    (slot name)
    (slot value)
    )


;; ----------------------------------------------------------------------------------------------------
(deftemplate studentValues
    (slot selection)
    (slot action)
    (slot input))

; tell productionRules file that templates have been parsed
(provide wmeTypes)
